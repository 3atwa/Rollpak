import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Card, 
  CardContent, 
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { 
  Email, 
  WhatsApp, 
  Contacts, 
  Person,
  TrendingUp,
  Message as MessageIcon,
  AdminPanelSettings,
  Security
} from '@mui/icons-material';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user, userRole, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalContacts: 0,
    totalMessages: 0,
    emailsSent: 0,
    whatsappSent: 0,
    totalUsers: 0
  });
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Email sx={{ fontSize: 16 }} />;
      case 'whatsapp':
        return <WhatsApp sx={{ fontSize: 16 }} />;
      default:
        return <Email sx={{ fontSize: 16 }} />;
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch contacts count
      const { count: contactsCount, error: contactsError } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true });

      if (contactsError) throw contactsError;

      // Fetch messages stats
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .order('sent_at', { ascending: false });

      if (messagesError) throw messagesError;

      // Calculate message stats
      const emailMessages = messages?.filter(msg => msg.sent_via && Array.isArray(msg.sent_via) && msg.sent_via.includes('email')) || [];
      const whatsappMessages = messages?.filter(msg => msg.sent_via && Array.isArray(msg.sent_via) && msg.sent_via.includes('whatsapp')) || [];

      // Fetch users count (admin only)
      let usersCount = 0;
      if (isAdmin()) {
        const { count, error: usersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        if (usersError) throw usersError;
        usersCount = count || 0;
      }

      setStats({
        totalContacts: contactsCount || 0,
        totalMessages: messages?.length || 0,
        emailsSent: emailMessages.length,
        whatsappSent: whatsappMessages.length,
        totalUsers: usersCount
      });

      setRecentMessages(messages?.slice(0, 5) || []);
    } catch (error: any) {
      setError(`Error loading dashboard: ${error.message}`);
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  const statCards = [
    {
      title: 'Total Contacts',
      value: stats.totalContacts,
      icon: <Contacts sx={{ fontSize: 40 }} />,
      color: 'primary.main',
      bgColor: 'primary.light',
    },
    {
      title: 'Total Messages',
      value: stats.totalMessages,
      icon: <MessageIcon sx={{ fontSize: 40 }} />,
      color: 'info.main',
      bgColor: 'info.light',
    },
    {
      title: 'Emails Sent',
      value: stats.emailsSent,
      icon: <Email sx={{ fontSize: 40 }} />,
      color: 'secondary.main',
      bgColor: 'secondary.light',
    },
    {
      title: 'WhatsApp Messages',
      value: stats.whatsappSent,
      icon: <WhatsApp sx={{ fontSize: 40 }} />,
      color: 'success.main',
      bgColor: 'success.light',
    },
  ];

  if (isAdmin()) {
    statCards.push({
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <Person sx={{ fontSize: 40 }} />,
      color: 'warning.main',
      bgColor: 'warning.light',
    });
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <TrendingUp sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Dashboard
        </Typography>
      </Box>

      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* Stats Cards */}
        {statCards.map((stat, index) => (
          <Box key={index} sx={{ 
            flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: isAdmin() ? '1 1 calc(20% - 12px)' : '1 1 calc(25% - 12px)' },
            minWidth: { xs: '100%', sm: 'calc(50% - 12px)', md: isAdmin() ? 'calc(20% - 12px)' : 'calc(25% - 12px)' }
          }}>
            <Card 
              sx={{ 
                borderRadius: 2,
                background: `linear-gradient(135deg, ${stat.bgColor}20 0%, ${stat.bgColor}10 100%)`,
                border: `1px solid ${stat.bgColor}30`,
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ color: stat.color, mb: 2 }}>
                  {stat.icon}
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700, color: stat.color, mb: 1 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ fontWeight: 500 }}>
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
        
        {/* Recent Messages */}
        <Box sx={{ width: '100%' }}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Recent Messages
            </Typography>
            {recentMessages.length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 4 }}>
                <MessageIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  No messages sent yet
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Start by composing your first message in the Messaging section
                </Typography>
              </Box>
            ) : (
              <List>
                {recentMessages.map((message, index) => (
                  <React.Fragment key={message.id}>
                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              Message to {message.recipients?.length || 0} recipient(s)
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              {message.sent_via && Array.isArray(message.sent_via) ? message.sent_via.map((via: string) => (
                                <Chip
                                  key={via}
                                  icon={getChannelIcon(via)}
                                  label={via.toUpperCase()}
                                  size="small"
                                  variant="outlined"
                                  sx={{ borderRadius: 1 }}
                                />
                              )) : null}
                            </Box>
                            <Typography variant="body2" color="textSecondary">
                              {new Date(message.sent_at).toLocaleString()}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography
                            variant="body2"
                            color="text.primary"
                            sx={{ 
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {message.content}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < recentMessages.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;