import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  Divider,
  Grid,
  Tooltip,
  Badge,
  Avatar,
  Menu,
  ListItemIcon,
  ListItemText,
  Checkbox
} from '@mui/material';
import { 
  Add, 
  Delete, 
  Edit, 
  AdminPanelSettings, 
  Person, 
  Search, 
  FilterList,
  MoreVert,
  Block,
  CheckCircle,
  Email,
  Phone,
  CalendarToday,
  Security,
  Refresh,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { supabase, UserRole } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

const UserController: React.FC = () => {
  const { user, signUp, isAdmin } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [bulkActions, setBulkActions] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: UserRole.USER,
    isActive: true
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      setError(`Error fetching users: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUserDialog = (user?: any) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        password: '', // Don't show existing password
        role: user.role,
        isActive: user.is_active !== false
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: '',
        password: '',
        role: UserRole.USER,
        isActive: true
      });
    }
    setOpenUserDialog(true);
  };

  const generateRandomPassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  const handleCloseUserDialog = () => {
    setOpenUserDialog(false);
    setEditingUser(null);
    setShowPassword(false);
    setFormData({
      email: '',
      password: '',
      role: UserRole.USER,
      isActive: true
    });
  };

  const handleSaveUser = async () => {
    try {
      if (editingUser) {
        // Update existing user
        const { error } = await supabase
          .from('users')
          .update({
            role: formData.role,
            is_active: formData.isActive
          })
          .eq('id', editingUser.id);

        if (error) throw error;
        setSuccess('User updated successfully!');
      } else {
        // Create new user using admin API
        if (!formData.password) {
          setError('Password is required for new users');
          return;
        }

        // Use admin API to create user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: formData.email,
          password: formData.password,
          email_confirm: true,
          user_metadata: {
            role: formData.role
          }
        });

        if (authError) {
          setError(`Error creating user: ${authError.message}`);
          return;
        }

        if (authData.user) {
          // Create user profile in users table
          const { error: profileError } = await supabase
            .from('users')
            .insert({
              id: authData.user.id,
              email: formData.email,
              role: formData.role,
              is_active: formData.isActive
            });

          if (profileError) {
            setError(`Error creating user profile: ${profileError.message}`);
            return;
          }

          setSuccess('User created successfully! They can now login with their email and password.');
        } else {
          setError('Failed to create user account');
          return;
        }
      }

      handleCloseUserDialog();
      fetchUsers();
    } catch (error: any) {
      setError(`Error saving user: ${error.message}`);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      setSuccess('User deleted successfully!');
      fetchUsers();
    } catch (error: any) {
      setError(`Error deleting user: ${error.message}`);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) {
      setError('Please select users to perform bulk actions');
      return;
    }

    try {
      switch (action) {
        case 'activate':
          await supabase
            .from('users')
            .update({ is_active: true })
            .in('id', selectedUsers);
          setSuccess(`${selectedUsers.length} users activated successfully!`);
          break;
        case 'deactivate':
          await supabase
            .from('users')
            .update({ is_active: false })
            .in('id', selectedUsers);
          setSuccess(`${selectedUsers.length} users deactivated successfully!`);
          break;
        case 'delete':
          if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
            await supabase
              .from('users')
              .delete()
              .in('id', selectedUsers);
            setSuccess(`${selectedUsers.length} users deleted successfully!`);
          }
          break;
      }
      setSelectedUsers([]);
      fetchUsers();
    } catch (error: any) {
      setError(`Error performing bulk action: ${error.message}`);
    }
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && (user.is_active === true || user.is_active === null)) ||
                         (statusFilter === 'inactive' && user.is_active === false);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const userStats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    users: users.filter(u => u.role === 'user').length,
    active: users.filter(u => u.is_active !== false).length
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <AdminPanelSettings sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          User Controller
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        <Box sx={{ flex: { xs: 1, md: 2 } }}>
          <Paper elevation={2} sx={{ borderRadius: 2 }}>
            <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    System Users
                  </Typography>
                  {selectedUsers.length > 0 && (
                    <Badge badgeContent={selectedUsers.length} color="primary">
                      <Chip 
                        label={`${selectedUsers.length} selected`} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </Badge>
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    variant="outlined" 
                    startIcon={<Refresh />} 
                    onClick={fetchUsers}
                    sx={{ borderRadius: 2 }}
                  >
                    Refresh
                  </Button>
                  <Button 
                    variant="contained" 
                    startIcon={<Add />} 
                    onClick={() => handleOpenUserDialog()}
                    sx={{ borderRadius: 2 }}
                  >
                    Add User
                  </Button>
                </Box>
              </Box>
              
              {/* Search and Filter */}
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="small"
                  sx={{ flex: 1 }}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={roleFilter}
                    label="Role"
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Roles</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="user">User</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Bulk Actions */}
              {selectedUsers.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1, mb: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ alignSelf: 'center', mr: 1 }}>
                    Bulk Actions:
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<CheckCircle />}
                    onClick={() => handleBulkAction('activate')}
                    variant="outlined"
                    color="success"
                  >
                    Activate
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Block />}
                    onClick={() => handleBulkAction('deactivate')}
                    variant="outlined"
                    color="warning"
                  >
                    Deactivate
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Delete />}
                    onClick={() => handleBulkAction('delete')}
                    variant="outlined"
                    color="error"
                  >
                    Delete
                  </Button>
                </Box>
              )}
            </Box>

            {filteredUsers.length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 4 }}>
                <Person sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  No users found
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {searchTerm || roleFilter !== 'all' ? 'Try adjusting your search criteria' : 'Add your first user to get started'}
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                          indeterminate={selectedUsers.length > 0 && selectedUsers.length < filteredUsers.length}
                          onChange={handleSelectAll}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} selected={selectedUsers.includes(user.id)}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleUserSelect(user.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: user.role === 'admin' ? 'error.main' : 'primary.main' }}>
                              {user.email.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {user.email}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ID: {user.id.slice(0, 8)}...
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.role.toUpperCase()}
                            color={user.role === 'admin' ? 'error' : 'primary'}
                            size="small"
                            variant="outlined"
                            icon={user.role === 'admin' ? <Security /> : <Person />}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={(user.is_active === true || user.is_active === null) ? 'Active' : 'Inactive'}
                            color={(user.is_active === true || user.is_active === null) ? 'success' : 'default'}
                            size="small"
                            variant="outlined"
                            icon={(user.is_active === true || user.is_active === null) ? <CheckCircle /> : <Block />}
                          />
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              {new Date(user.created_at).toLocaleDateString()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(user.created_at).toLocaleTimeString()}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="Edit User">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenUserDialog(user)}
                                color="primary"
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="More Actions">
                              <IconButton
                                size="small"
                                onClick={(e) => handleMenuOpen(e, user)}
                                color="default"
                              >
                                <MoreVert />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Box>

        <Box sx={{ flex: { xs: 1, md: 1 } }}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                User Statistics
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Total Users
                </Typography>
                <Typography variant="h4" color="primary.main">
                  {userStats.total}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Administrators
                </Typography>
                <Typography variant="h4" color="error.main">
                  {userStats.admins}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Standard Users
                </Typography>
                <Typography variant="h4" color="success.main">
                  {userStats.users}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Active Users
                </Typography>
                <Typography variant="h4" color="info.main">
                  {userStats.active}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* User Add/Edit Dialog */}
      <Dialog open={openUserDialog} onClose={handleCloseUserDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          {editingUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
              disabled={!!editingUser}
              required
            />
            
            {!editingUser && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  helperText="Required for new users"
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    )
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={generateRandomPassword}
                  sx={{ mb: 1, minWidth: 120 }}
                >
                  Generate
                </Button>
              </Box>
            )}
            
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                label="Role"
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUserDialog}>Cancel</Button>
          <Button onClick={handleSaveUser} variant="contained">
            {editingUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { minWidth: 200 }
        }}
      >
        <MenuItem onClick={() => { handleOpenUserDialog(selectedUser); handleMenuClose(); }}>
          <ListItemIcon>
            <Edit />
          </ListItemIcon>
          <ListItemText>Edit User</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { 
          if (selectedUser) {
            handleBulkAction(selectedUser.is_active !== false ? 'deactivate' : 'activate');
            handleMenuClose();
          }
        }}>
          <ListItemIcon>
            {selectedUser?.is_active !== false ? <Block /> : <CheckCircle />}
          </ListItemIcon>
          <ListItemText>
            {selectedUser?.is_active !== false ? 'Deactivate' : 'Activate'}
          </ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => { 
            if (selectedUser) {
              handleDeleteUser(selectedUser.id);
              handleMenuClose();
            }
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <Delete color="error" />
          </ListItemIcon>
          <ListItemText>Delete User</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default UserController;
