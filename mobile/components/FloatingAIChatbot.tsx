import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../constants/theme';
import { api } from '../services/api';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  'Which ingredients are running low?',
  'What should I restock today?',
  'Which ingredient might run out first?',
  'Explain the latest inventory anomaly',
  'What happens if demand increases by 40%?',
];

export const FloatingAIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: 'Greetings, Master Alchemist. I am SPELLSTOCK INTELLIGENCE. How may I assist your apothecary today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const scrollViewRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Build history for backend
      const history = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const res = await api.sendChatMessage(text, history);
      const botResponse = res.data?.response || res.data?.reply || res.data?.message || 'The crystal ball is clouded. Please ask again.';

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: botResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Alchemical connection disturbed: Unable to consult the grimoire. Check your backend connection in Profile.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'assistant',
        text: 'The slate is cleansed. What mysteries shall we unravel next?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <>
      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="sparkles" size={24} color={colors.accentGold} />
      </TouchableOpacity>

      {/* Full Modal Chat Window */}
      <Modal visible={isOpen} animationType="slide" transparent={false} onRequestClose={() => setIsOpen(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <KeyboardAvoidingView
            style={styles.keyboardContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            {/* Header */}
            <View style={styles.chatHeader}>
              <View style={styles.headerLeft}>
                <View style={styles.avatarOrb}>
                  <Ionicons name="sparkles" size={18} color={colors.accentGold} />
                </View>
                <View>
                  <Text style={styles.botTitle}>SPELLSTOCK INTELLIGENCE</Text>
                  <Text style={styles.botSubtitle}>Your Intelligent Inventory Companion</Text>
                </View>
              </View>

              <View style={styles.headerActions}>
                <TouchableOpacity onPress={handleClearChat} style={styles.headerBtn} accessibilityLabel="Clear Chat">
                  <Ionicons name="trash-outline" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsOpen(false)} style={styles.headerBtn}>
                  <Ionicons name="close" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick Prompts */}
            <View style={styles.quickPromptsContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickPromptsList}>
                {QUICK_PROMPTS.map((prompt, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.quickPromptChip}
                    onPress={() => handleSendMessage(prompt)}
                  >
                    <Ionicons name="chatbubble-ellipses-outline" size={12} color={colors.accentGold} />
                    <Text style={styles.quickPromptText}>{prompt}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Messages Scroll Area */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesArea}
              contentContainerStyle={styles.messagesContent}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
              {messages.map((m) => {
                const isUser = m.sender === 'user';
                return (
                  <View
                    key={m.id}
                    style={[
                      styles.messageRow,
                      isUser ? styles.messageRowUser : styles.messageRowBot,
                    ]}
                  >
                    {!isUser && (
                      <View style={styles.messageAvatar}>
                        <Ionicons name="flask" size={14} color={colors.accentGold} />
                      </View>
                    )}
                    <View
                      style={[
                        styles.messageBubble,
                        isUser ? styles.messageBubbleUser : styles.messageBubbleBot,
                      ]}
                    >
                      <Text style={[styles.messageText, isUser ? styles.messageTextUser : styles.messageTextBot]}>
                        {m.text}
                      </Text>
                      <Text style={[styles.messageTime, isUser ? styles.messageTimeUser : styles.messageTimeBot]}>
                        {m.timestamp}
                      </Text>
                    </View>
                  </View>
                );
              })}

              {isTyping && (
                <View style={[styles.messageRow, styles.messageRowBot]}>
                  <View style={styles.messageAvatar}>
                    <Ionicons name="sparkles" size={14} color={colors.accentGold} />
                  </View>
                  <View style={[styles.messageBubble, styles.messageBubbleBot, styles.typingBubble]}>
                    <ActivityIndicator size="small" color={colors.accentEmerald} />
                    <Text style={styles.typingText}>Consulting grimoire...</Text>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Input Bar */}
            <View style={styles.inputBar}>
              <TextInput
                style={styles.inputField}
                placeholder="Ask about ingredients, restock, anomalies..."
                placeholderTextColor={colors.textMuted}
                value={inputMessage}
                onChangeText={setInputMessage}
                multiline
                maxLength={500}
                returnKeyType="send"
                onSubmitEditing={() => handleSendMessage()}
              />
              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  !inputMessage.trim() && styles.sendBtnDisabled,
                ]}
                onPress={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isTyping}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="arrow-up"
                  size={20}
                  color={inputMessage.trim() ? colors.textPrimary : colors.textMuted}
                />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 85,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.bgForest,
    borderWidth: 2,
    borderColor: colors.accentGold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accentEmerald,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 999,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.bgMidnight,
  },
  keyboardContainer: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    backgroundColor: colors.bgForest,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  avatarOrb: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(197, 164, 109, 0.15)',
    borderWidth: 1,
    borderColor: colors.accentGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 14,
  },
  botSubtitle: {
    ...typography.caption,
    color: colors.accentGold,
    fontSize: 11,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerBtn: {
    padding: spacing.xs,
  },
  quickPromptsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    backgroundColor: colors.bgMidnight,
    paddingVertical: spacing.xs,
  },
  quickPromptsList: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  quickPromptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.bgForest,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: borderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
  },
  quickPromptText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  messagesArea: {
    flex: 1,
    backgroundColor: colors.bgMidnight,
  },
  messagesContent: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    maxWidth: '85%',
  },
  messageRowUser: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  messageRowBot: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  messageAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.bgForest,
    borderWidth: 1,
    borderColor: colors.accentGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  messageBubble: {
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  messageBubbleUser: {
    backgroundColor: colors.accentEmerald,
    borderBottomRightRadius: 4,
  },
  messageBubbleBot: {
    backgroundColor: colors.bgForest,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    ...typography.body,
    fontSize: 14,
    lineHeight: 20,
  },
  messageTextUser: {
    color: colors.textPrimary,
  },
  messageTextBot: {
    color: colors.textSecondary,
  },
  messageTime: {
    ...typography.caption,
    fontSize: 10,
    marginTop: 4,
  },
  messageTimeUser: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  messageTimeBot: {
    color: colors.textMuted,
    textAlign: 'left',
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  typingText: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.bgForest,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    gap: spacing.sm,
  },
  inputField: {
    flex: 1,
    backgroundColor: colors.bgMidnight,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: borderRadius.lg,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    maxHeight: 90,
    fontSize: 14,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accentEmerald,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: colors.bgMidnight,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
});
