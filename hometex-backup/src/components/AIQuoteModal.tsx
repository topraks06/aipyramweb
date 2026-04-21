
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Send, Bot, User, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/i18n';

interface AIQuoteModalProps {
  open: boolean;
  onClose: () => void;
  showroomName: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AIQuoteModal({ open, onClose, showroomName }: AIQuoteModalProps) {
  const { language } = useLanguage();
  const t = (key: string) => getTranslation(language, key);
  const [step, setStep] = useState<'form' | 'chat'>('form');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [formData, setFormData] = useState({
    product: '',
    quantity: '',
    budget: '',
    notes: '',
  });

  const handleFormSubmit = async () => {
    setLoading(true);
    const initialMsg = `Merhaba! ${showroomName} firmasından teklif almak istiyorum. Ürün: ${formData.product}, Miktar: ${formData.quantity}, Bütçe: ${formData.budget}. ${formData.notes}`;
    const aiResponse = `Merhaba! ${showroomName} adına size yardımcı olmaktan memnuniyet duyarım. 

**Talebinizi aldım:**
- 📦 Ürün: ${formData.product}
- 📊 Miktar: ${formData.quantity}
- 💰 Bütçe: ${formData.budget}

Ürünlerimiz hakkında size özel bir teklif hazırlıyorum. Birkaç sorum var:

1. Teslimat süreniz ne kadar?
2. Özel renk veya desen tercihiniz var mı?
3. Sertifika gereksiniminiz (ISO, OEKO-TEX vb.) var mı?`;

    setMessages([
      { role: 'user', content: initialMsg },
      { role: 'assistant', content: aiResponse },
    ]);
    setStep('chat');
    setLoading(false);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    const newMessages: Message[] = [...messages, { role: 'user', content: userInput }];
    setMessages(newMessages);
    setUserInput('');
    setLoading(true);

    await new Promise(r => setTimeout(r, 1000));
    const aiReply = `Teşekkürler! Bilgilerinizi kaydettim. Satış ekibimiz 24 saat içinde size detaylı teklif gönderecektir. 

✅ Talebiniz alındı
📧 E-posta ile bildirim gönderilecek
📞 Gerekirse sizi arayacağız

Başka sorunuz var mı?`;

    setMessages([...newMessages, { role: 'assistant', content: aiReply }]);
    setLoading(false);
  };

  const handleClose = () => {
    setStep('form');
    setMessages([]);
    setFormData({ product: '', quantity: '', budget: '', notes: '' });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#D4AF37] to-[#C5A028] rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-base font-bold">AI Teklif Asistanı</div>
              <div className="text-xs text-[#2C2C2C]/60 font-normal">{showroomName}</div>
            </div>
            <Badge className="ml-auto bg-green-500/10 text-green-700 border-green-500/20 text-xs">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse" />
              Çevrimiçi
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {step === 'form' ? (
          <div className="space-y-4 overflow-y-auto">
            <p className="text-sm text-[#2C2C2C]/70">
              Teklif almak istediğiniz ürün bilgilerini girin, AI asistanımız size yardımcı olsun.
            </p>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Ürün / Hizmet *</Label>
              <Input
                placeholder="Örn: Kadife perde kumaşı"
                value={formData.product}
                onChange={(e) => setFormData(p => ({ ...p, product: e.target.value }))}
                className="border-[#D4AF37]/30 focus:border-[#D4AF37]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Miktar</Label>
                <Input
                  placeholder="1000 metre"
                  value={formData.quantity}
                  onChange={(e) => setFormData(p => ({ ...p, quantity: e.target.value }))}
                  className="border-[#D4AF37]/30 focus:border-[#D4AF37]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Bütçe</Label>
                <Input
                  placeholder="$5000"
                  value={formData.budget}
                  onChange={(e) => setFormData(p => ({ ...p, budget: e.target.value }))}
                  className="border-[#D4AF37]/30 focus:border-[#D4AF37]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Ek Notlar</Label>
              <Textarea
                placeholder="Özel gereksinimler, renk tercihleri..."
                value={formData.notes}
                onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
                rows={3}
                className="border-[#D4AF37]/30 focus:border-[#D4AF37]"
              />
            </div>
            <Button
              onClick={handleFormSubmit}
              disabled={!formData.product || loading}
              className="w-full bg-[#D4AF37] hover:bg-[#C5A028] text-white font-bold"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <>
                  <Sparkles className="mr-2 w-4 h-4" />
                  AI ile Teklif Al
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 bg-[#D4AF37] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-[#D4AF37] text-white rounded-tr-sm'
                      : 'bg-[#F5F5DC] text-[#2C2C2C] rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 bg-[#2C2C2C] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 bg-[#D4AF37] rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-[#F5F5DC] rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Mesajınızı yazın..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="border-[#D4AF37]/30 focus:border-[#D4AF37]"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!userInput.trim() || loading}
                className="bg-[#D4AF37] hover:bg-[#C5A028] text-white px-3"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
