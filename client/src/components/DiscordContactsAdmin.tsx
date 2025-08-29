import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  MessageCircle, Trophy, User, MapPin, Phone, 
  CheckCircle, Clock, Copy, RefreshCw, Send
} from 'lucide-react';

interface DiscordContact {
  id: string;
  winner_id: string;
  user_email: string;
  discord_username: string;
  full_name: string;
  address: string;
  phone: string;
  giveaway_title: string;
  prize: string;
  connected_at: number;
  admin_contacted: boolean;
  admin_contacted_at?: number;
  prize_sent: boolean;
  prize_sent_at?: number;
  notes: string;
}

export function DiscordContactsAdmin() {
  const [contacts, setContacts] = useState<DiscordContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedContact, setSelectedContact] = useState<DiscordContact | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/winners/connect-discord');
      const result = await response.json();
      
      if (result.success) {
        setContacts(result.contacts || []);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsContacted = async (contactId: string) => {
    try {
      const response = await fetch('/api/winners/mark-contacted', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId,
          adminId: 'admin', // Melhorar para ID real
          notes: adminNotes
        })
      });

      if (response.ok) {
        await loadContacts();
        alert('✅ Marcado como contactado!');
        setAdminNotes('');
      }
    } catch (error) {
      alert('❌ Erro ao marcar como contactado');
    }
  };

  const markAsSent = async (contactId: string) => {
    try {
      const response = await fetch('/api/winners/mark-sent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId,
          adminId: 'admin'
        })
      });

      if (response.ok) {
        await loadContacts();
        alert('✅ Marcado como enviado!');
      }
    } catch (error) {
      alert('❌ Erro ao marcar como enviado');
    }
  };

  const copyDiscordContact = (contact: DiscordContact) => {
    const message = `Olá ${contact.discord_username}! 🎉\n\nParabéns! Você ganhou "${contact.prize}" no giveaway "${contact.giveaway_title}"!\n\nPara enviar seu prêmio, confirme seus dados:\n📧 Email: ${contact.user_email}\n👤 Nome: ${contact.full_name}\n📍 Endereço: ${contact.address}\n📞 Telefone: ${contact.phone}\n\nVou providenciar o envio em breve!`;
    
    navigator.clipboard.writeText(message);
    alert('📋 Mensagem copiada! Cole no Discord para contactar o ganhador.');
  };

  const pendingContacts = contacts.filter(c => !c.admin_contacted);
  const contactedContacts = contacts.filter(c => c.admin_contacted && !c.prize_sent);
  const completedContacts = contacts.filter(c => c.prize_sent);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-3">
            <MessageCircle className="h-7 w-7 text-blue-500" />
            💬 Contatos Discord
          </h3>
          <p className="text-muted-foreground mt-1">
            Ganhadores que conectaram Discord para receber prêmios
          </p>
        </div>
        <Button
          onClick={loadContacts}
          disabled={loading}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-6 w-6 text-yellow-500" />
              <div>
                <p className="text-xl font-bold">{pendingContacts.length}</p>
                <p className="text-xs text-muted-foreground">Aguardando Contato</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-6 w-6 text-blue-500" />
              <div>
                <p className="text-xl font-bold">{contactedContacts.length}</p>
                <p className="text-xs text-muted-foreground">Contactados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <div>
                <p className="text-xl font-bold">{completedContacts.length}</p>
                <p className="text-xs text-muted-foreground">Enviados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Contacts */}
      {pendingContacts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              ⏳ Aguardando Seu Contato
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingContacts.map((contact) => (
                <Card key={contact.id} className="border-l-4 border-l-yellow-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Trophy className="h-5 w-5 text-yellow-500" />
                          <h4 className="font-semibold">{contact.giveaway_title}</h4>
                          <Badge className="bg-yellow-500 text-white">
                            {contact.prize}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Discord:</span>
                            <p className="font-mono font-medium">{contact.discord_username}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Email:</span>
                            <p className="font-medium">{contact.user_email}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Nome:</span>
                            <p className="font-medium">{contact.full_name}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Conectado:</span>
                            <p className="font-medium">
                              {new Date(contact.connected_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>

                        {contact.address && (
                          <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-900/20 rounded border">
                            <span className="text-sm text-muted-foreground">Endereço:</span>
                            <p className="text-sm">{contact.address}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4 flex-col">
                        <Button
                          size="sm"
                          onClick={() => copyDiscordContact(contact)}
                          className="bg-blue-500 hover:bg-blue-600"
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copiar DM
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markAsContacted(contact.id)}
                          className="text-green-600 border-green-600"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Marcar Contactado
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contacted but not sent */}
      {contactedContacts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-500" />
              💬 Contactados - Aguardando Envio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contactedContacts.map((contact) => (
                <Card key={contact.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <MessageCircle className="h-5 w-5 text-blue-500" />
                          <h4 className="font-semibold">{contact.giveaway_title}</h4>
                          <Badge className="bg-blue-500 text-white">
                            Contactado
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          Discord: <span className="font-mono">{contact.discord_username}</span> • 
                          Contactado em: {new Date(contact.admin_contacted_at || 0).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      
                      <Button
                        size="sm"
                        onClick={() => markAsSent(contact.id)}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Marcar Enviado
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed */}
      {completedContacts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              ✅ Prêmios Enviados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {completedContacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200">
                  <div>
                    <span className="font-medium">{contact.giveaway_title}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      → {contact.discord_username}
                    </span>
                  </div>
                  <Badge className="bg-green-500 text-white">
                    Concluído
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {contacts.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              Nenhum ganhador conectou Discord ainda
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}