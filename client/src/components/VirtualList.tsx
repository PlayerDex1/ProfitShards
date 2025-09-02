import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
  onEndReached?: () => void;
  endReachedThreshold?: number;
  loading?: boolean;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
}

export function VirtualList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  overscan = 5,
  className = '',
  onScroll,
  onEndReached,
  endReachedThreshold = 0.8,
  loading = false,
  loadingComponent,
  emptyComponent
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  // Configurar virtualizer
  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan,
  });

  // Calcular dimensões
  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  // Padding para manter scroll position
  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start || 0 : 0;
  const paddingBottom = virtualItems.length > 0 
    ? totalSize - (virtualItems[virtualItems.length - 1].end || 0) 
    : 0;

  // Detectar quando chegou ao final
  useEffect(() => {
    if (!onEndReached || loading) return;

    const lastItem = virtualItems[virtualItems.length - 1];
    if (!lastItem) return;

    const threshold = Math.floor(items.length * endReachedThreshold);
    if (lastItem.index >= threshold) {
      onEndReached();
    }
  }, [virtualItems, items.length, endReachedThreshold, onEndReached, loading]);

  // Handler de scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setScrollTop(scrollTop);
    onScroll?.(scrollTop);
  }, [onScroll]);

  // Renderizar item virtual
  const renderVirtualItem = useCallback((virtualItem: any) => {
    const item = items[virtualItem.index];
    if (!item) return null;

    return (
      <div
        key={virtualItem.key}
        data-index={virtualItem.index}
        ref={rowVirtualizer.measureElement}
        className="virtual-item"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: `${virtualItem.size}px`,
          transform: `translateY(${virtualItem.start}px)`,
        }}
      >
        {renderItem(item, virtualItem.index)}
      </div>
    );
  }, [items, renderItem, rowVirtualizer]);

  // Componente de loading
  const LoadingComponent = loadingComponent || (
    <div className="flex items-center justify-center py-4">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      <span className="ml-2 text-sm text-muted-foreground">Carregando mais itens...</span>
    </div>
  );

  // Componente vazio
  const EmptyComponent = emptyComponent || (
    <div className="flex items-center justify-center py-8 text-center">
      <div>
        <p className="text-lg font-medium text-muted-foreground mb-2">Nenhum item encontrado</p>
        <p className="text-sm text-muted-foreground">Tente ajustar os filtros ou criar novos itens</p>
      </div>
    </div>
  );

  // Se não há itens, mostrar componente vazio
  if (items.length === 0 && !loading) {
    return (
      <div className={`virtual-list ${className}`} style={{ height }}>
        {EmptyComponent}
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={`virtual-list overflow-auto ${className}`}
      style={{ height }}
      onScroll={handleScroll}
    >
      <div
        style={{
          height: `${totalSize}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map(renderVirtualItem)}
        
        {/* Loading no final da lista */}
        {loading && (
          <div
            style={{
              position: 'absolute',
              top: `${totalSize}px`,
              left: 0,
              width: '100%',
            }}
          >
            {LoadingComponent}
          </div>
        )}
      </div>
    </div>
  );
}

// Hook para virtual scrolling com dados paginados
export function useVirtualScrolling<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan = 5
) {
  const [scrollTop, setScrollTop] = useState(0);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });

  // Calcular itens visíveis
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length
    );

    return {
      start: Math.max(0, startIndex - overscan),
      end: endIndex,
      items: items.slice(startIndex, endIndex)
    };
  }, [items, itemHeight, containerHeight, overscan, scrollTop]);

  // Atualizar range visível
  useEffect(() => {
    setVisibleRange({
      start: visibleItems.start,
      end: visibleItems.end
    });
  }, [visibleItems.start, visibleItems.end]);

  return {
    scrollTop,
    setScrollTop,
    visibleRange,
    visibleItems: visibleItems.items,
    totalHeight: items.length * itemHeight,
    itemHeight
  };
}

// Componente de virtual scrolling otimizado para tabelas
export function VirtualTable<T>({
  items,
  columns,
  height,
  rowHeight = 48,
  overscan = 10,
  className = '',
  onRowClick,
  selectedRows,
  onSelectionChange,
  loading = false,
  loadingComponent,
  emptyComponent
}: {
  items: T[];
  columns: {
    key: string;
    header: string;
    width?: number;
    render: (item: T, index: number) => React.ReactNode;
  }[];
  height: number;
  rowHeight?: number;
  overscan?: number;
  className?: string;
  onRowClick?: (item: T, index: number) => void;
  selectedRows?: Set<number>;
  onSelectionChange?: (selected: Set<number>) => void;
  loading?: boolean;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
}) {
  const [selected, setSelected] = useState<Set<number>>(selectedRows || new Set());
  const parentRef = useRef<HTMLDivElement>(null);

  // Configurar virtualizer
  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  // Handler de seleção
  const handleRowSelect = useCallback((index: number) => {
    if (!onSelectionChange) return;

    const newSelected = new Set(selected);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    
    setSelected(newSelected);
    onSelectionChange(newSelected);
  }, [selected, onSelectionChange]);

  // Handler de clique na linha
  const handleRowClick = useCallback((item: T, index: number) => {
    onRowClick?.(item, index);
  }, [onRowClick]);

  // Calcular larguras das colunas
  const columnWidths = useMemo(() => {
    const totalWidth = columns.reduce((sum, col) => sum + (col.width || 150), 0);
    return columns.map(col => ({
      ...col,
      width: col.width || 150,
      percentage: ((col.width || 150) / totalWidth) * 100
    }));
  }, [columns]);

  // Renderizar cabeçalho
  const renderHeader = () => (
    <div className="sticky top-0 bg-background border-b z-10">
      <div className="flex">
        {onSelectionChange && (
          <div className="flex items-center justify-center p-2 border-r" style={{ width: 50 }}>
            <input
              type="checkbox"
              checked={selected.size === items.length && items.length > 0}
              onChange={(e) => {
                if (e.target.checked) {
                  const allSelected = new Set(items.map((_, i) => i));
                  setSelected(allSelected);
                  onSelectionChange(allSelected);
                } else {
                  setSelected(new Set());
                  onSelectionChange(new Set());
                }
              }}
              className="rounded"
            />
          </div>
        )}
        {columnWidths.map((col, index) => (
          <div
            key={col.key}
            className="p-2 font-medium text-sm border-r last:border-r-0"
            style={{ 
              width: col.width,
              minWidth: col.width,
              maxWidth: col.width
            }}
          >
            {col.header}
          </div>
        ))}
      </div>
    </div>
  );

  // Renderizar linha
  const renderRow = (virtualItem: any) => {
    const item = items[virtualItem.index];
    if (!item) return null;

    const isSelected = selected.has(virtualItem.index);

    return (
      <div
        key={virtualItem.key}
        data-index={virtualItem.index}
        ref={rowVirtualizer.measureElement}
        className={`flex border-b hover:bg-muted/50 transition-colors ${
          isSelected ? 'bg-primary/10' : ''
        } ${onRowClick ? 'cursor-pointer' : ''}`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: `${virtualItem.size}px`,
          transform: `translateY(${virtualItem.start}px)`,
        }}
        onClick={() => handleRowClick(item, virtualItem.index)}
      >
        {onSelectionChange && (
          <div className="flex items-center justify-center p-2 border-r" style={{ width: 50 }}>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                handleRowSelect(virtualItem.index);
              }}
              className="rounded"
            />
          </div>
        )}
        {columnWidths.map((col, colIndex) => (
          <div
            key={col.key}
            className="p-2 border-r last:border-r-0 overflow-hidden"
            style={{ 
              width: col.width,
              minWidth: col.width,
              maxWidth: col.width
            }}
          >
            {col.render(item, virtualItem.index)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`virtual-table ${className}`}>
      {renderHeader()}
      <div
        ref={parentRef}
        className="overflow-auto"
        style={{ height: height - 50 }} // Subtrair altura do cabeçalho
      >
        <div
          style={{
            height: `${totalSize}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualItems.map(renderRow)}
          
          {loading && (
            <div
              style={{
                position: 'absolute',
                top: `${totalSize}px`,
                left: 0,
                width: '100%',
              }}
            >
              {loadingComponent || (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span className="ml-2 text-sm text-muted-foreground">Carregando...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}