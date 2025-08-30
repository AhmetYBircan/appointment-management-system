import { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import { DatePicker, DateTimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, startOfDay, endOfDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toZonedTime } from 'date-fns-tz';
import api, { apiFunctions } from './services/api';
import type { Appointment, CreateAppointmentDto } from './types/appointment';
import MuiAlert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDebounce } from 'use-debounce';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import type { Patient } from './types/patient';
import type { Category } from './types/category';
import { useNavigate } from 'react-router-dom';

import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Avatar from '@mui/material/Avatar';
import Autocomplete from '@mui/material/Autocomplete';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Menu from '@mui/material/Menu';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import CategoryIcon from '@mui/icons-material/Category';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import SecurityIcon from '@mui/icons-material/Security';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Switch from '@mui/material/Switch';

const TIMEZONE = 'Europe/Istanbul';

function Dashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [openDialog, setOpenDialog] = useState(false);
  const [newAppointment, setNewAppointment] = useState<{
    title: string;
    startTime: Date | null;
    endTime: Date | null;
    notes: string;
    patientId: string | null;
    categoryId: string | null;
  }>({
    title: '',
    startTime: null,
    endTime: null,
    notes: '',
    patientId: null,
    categoryId: null,
  });
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [selectedRightDate, setSelectedRightDate] = useState<Date | null>(toZonedTime(new Date(), TIMEZONE));
  const [rightDayAppointments, setRightDayAppointments] = useState<Appointment[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [editForm, setEditForm] = useState<{
    title: string;
    startTime: Date | null;
    endTime: Date | null;
    notes: string;
    patientId: string | null;
    categoryId: string | null;
  }>({ title: '', startTime: null, endTime: null, notes: '', patientId: null, categoryId: null });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingAppointment, setDeletingAppointment] = useState<Appointment | null>(null);
  const [newPatientDialogOpen, setNewPatientDialogOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    phoneNumber: '',
    mail: '',
  });
  const [editPatientDialogOpen, setEditPatientDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deletePatientDialogOpen, setDeletePatientDialogOpen] = useState(false);
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [editPatientSearchQuery, setEditPatientSearchQuery] = useState('');
  const [searchedPatients, setSearchedPatients] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [debouncedSearchQuery] = useDebounce(patientSearchQuery, 500);
  const [debouncedEditSearchQuery] = useDebounce(editPatientSearchQuery, 500);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [allPatientsDialogOpen, setAllPatientsDialogOpen] = useState(false);
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryListDialogOpen, setCategoryListDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<{ name: string; type: string }>({ name: '', type: '' });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCategoryFields, setEditCategoryFields] = useState<{ name: string; type: string }>({ name: '', type: '' });
  const [selectedFilterPatient, setSelectedFilterPatient] = useState<Patient | null>(null);
  const [filterPatientSearchQuery, setFilterPatientSearchQuery] = useState('');
  const [filterSearchResults, setFilterSearchResults] = useState<Patient[]>([]);
  const [isFilterSearching, setIsFilterSearching] = useState(false);
  const [debouncedFilterSearchQuery] = useDebounce(filterPatientSearchQuery, 500);
  // Yeni randevu formu için ayrı danışan arama state'leri
  const [appointmentPatientSearchQuery, setAppointmentPatientSearchQuery] = useState('');
  const [appointmentSearchedPatients, setAppointmentSearchedPatients] = useState<Patient[]>([]);
  const [appointmentIsSearching, setAppointmentIsSearching] = useState(false);
  const [appointmentSelectedPatient, setAppointmentSelectedPatient] = useState<Patient | null>(null);
  const [debouncedAppointmentPatientSearchQuery] = useDebounce(appointmentPatientSearchQuery, 500);
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string | null>(null);
  const [categoryCounts, setCategoryCounts] = useState<{ id: string, name: string, type: string, count: number }[]>([]);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [viewUsersDialogOpen, setViewUsersDialogOpen] = useState(false);
  const [usersMenuAnchor, setUsersMenuAnchor] = useState<null | HTMLElement>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [newUser, setNewUser] = useState({
    name: '',
    password: '',
    password2: '',
    phoneNumber: '',
    mail: '',
    type: 'employee'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [userError, setUserError] = useState('');
  const [userSuccess, setUserSuccess] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const navigate = useNavigate();
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editUserForm, setEditUserForm] = useState({
    name: '',
    phoneNumber: '',
    mail: '',
    type: 'employee'
  });
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] = useState(false);
  const [updateProfileDialogOpen, setUpdateProfileDialogOpen] = useState(false);
  const [changePasswordForm, setChangePasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [updateProfileForm, setUpdateProfileForm] = useState({
    name: '',
    mail: '',
    phoneNumber: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [deletingUser, setDeletingUser] = useState<any | null>(null);
  const [settingsMenuAnchor, setSettingsMenuAnchor] = useState<null | HTMLElement>(null);
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [userName, setUserName] = useState(getUserNameFromToken());
  const [showPassiveUsers, setShowPassiveUsers] = useState(false);
  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);
  const handleOpenEditUserDialog = () => setEditUserDialogOpen(true);
  const handleCloseEditUserDialog = () => setEditUserDialogOpen(false);
  const handleOpenDeleteUserDialog = () => setDeleteUserDialogOpen(true);
  const handleCloseDeleteUserDialog = () => setDeleteUserDialogOpen(false);
  const handleOpenNewPatientDialog = () => setNewPatientDialogOpen(true);
  const handleCloseNewPatientDialog = () => setNewPatientDialogOpen(false);
  const handleCloseChangePasswordDialog = () => setChangePasswordDialogOpen(false);
  const handleCloseUpdateProfileDialog = () => setUpdateProfileDialogOpen(false);

  useEffect(() => {
    loadAppointments();
    loadTodayAppointments();
    loadCategories();
    fetchCategoryCounts();
    loadAllPatients();
  }, []);

  useEffect(() => {
    if (debouncedSearchQuery) {
      search(debouncedSearchQuery);
    } else {
      setSearchedPatients([]);
    }
  }, [debouncedSearchQuery]);

  useEffect(() => {
    if (debouncedEditSearchQuery) {
      search(debouncedEditSearchQuery);
    } else {
      setSearchedPatients([]);
    }
  }, [debouncedEditSearchQuery]);

  useEffect(() => {
    if (debouncedFilterSearchQuery) {
      searchForFilter(debouncedFilterSearchQuery);
    } else {
      setFilterSearchResults([]);
    }
  }, [debouncedFilterSearchQuery]);

  useEffect(() => {
    if (debouncedAppointmentPatientSearchQuery) {
      searchAppointmentPatient(debouncedAppointmentPatientSearchQuery);
    } else {
      setAppointmentSearchedPatients([]);
    }
  }, [debouncedAppointmentPatientSearchQuery]);

  useEffect(() => {
    if (selectedRightDate) {
      loadRightDayAppointments(selectedRightDate);
    }
  }, [selectedRightDate]);

  // FİLTRELİ RANDEVU ÇEKMEK İÇİN YENİ useEffect
  useEffect(() => {
    // Hiçbir filtre yoksa bugünün randevularını getir
    if (!selectedFilterPatient && !selectedFilterCategory && !selectedRightDate) {
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
      apiFunctions.filterAppointments({
        startDate: startOfDay.toISOString(),
        endDate: endOfDay.toISOString()
      })
        .then(setRightDayAppointments)
        .catch(() => setRightDayAppointments([]));
      return;
    }
    // Filtre parametrelerini hazırla
    const params: any = {};
    if (selectedRightDate) {
      const startOfDay = new Date(selectedRightDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedRightDate);
      endOfDay.setHours(23, 59, 59, 999);
      params.startDate = startOfDay.toISOString();
      params.endDate = endOfDay.toISOString();
    }
    if (selectedFilterPatient) {
      params.patientId = selectedFilterPatient.id;
    }
    if (selectedFilterCategory) {
      params.categoryName = selectedFilterCategory;
    }
    apiFunctions.filterAppointments(params)
      .then(setRightDayAppointments)
      .catch(() => setRightDayAppointments([]));
  }, [selectedFilterPatient, selectedFilterCategory, selectedRightDate]);

  const loadAppointments = async () => {
    try {
      const appointments = await apiFunctions.getAllAppointments();
      setAppointments(appointments);
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  const loadTodayAppointments = async () => {
    try {
      const today = new Date();
      const startOfToday = startOfDay(today);
      const endOfToday = endOfDay(today);
      const appointments = await apiFunctions.getAppointmentsByDateRange(
        startOfToday.toISOString(),
        endOfToday.toISOString()
      );
      setTodayAppointments(appointments);
    } catch (error) {
      console.error('Error loading today appointments:', error);
    }
  };

  const loadRightDayAppointments = async (date: Date | null) => {
    if (!date) return;
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      const appointments = await apiFunctions.getAppointmentsByDateRange(
        startOfDay.toISOString(),
        endOfDay.toISOString()
      );
      setRightDayAppointments(appointments);
    } catch (error) {
      console.error('Error loading right day appointments:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const categories = await apiFunctions.getAllCategories();
      setCategories(categories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const fetchCategoryCounts = async () => {
    try {
      const today = new Date();
      const counts = await apiFunctions.getCategoryCountsByDay(today.toISOString());
      setCategoryCounts(counts);
    } catch (error) {
      console.error('Error fetching category counts:', error);
    }
  };

  const handleCreateAppointment = async () => {
    if (!newAppointment.startTime || !newAppointment.endTime || !newAppointment.patientId || !newAppointment.categoryId) {
      setErrorMessage('Lütfen tüm zorunlu alanları doldurun: başlangıç, bitiş, danışan ve kategori.');
      setShowError(true);
      return;
    }
    const payload: CreateAppointmentDto = {
      ...newAppointment,
      startTime: toZonedTime(newAppointment.startTime, TIMEZONE).toISOString(),
      endTime: toZonedTime(newAppointment.endTime, TIMEZONE).toISOString(),
    };
    try {
      const created = await apiFunctions.createAppointment(payload);
      setOpenDialog(false);
      setNewAppointment({ title: '', startTime: null, endTime: null, notes: '', patientId: null, categoryId: null });
      setPatientSearchQuery('');
      setSelectedPatient(null);
      loadAppointments();
      loadTodayAppointments();
      loadRightDayAppointments(selectedRightDate);
      fetchCategoryCounts();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || 'Bir hata oluştu.');
      setShowError(true);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    await apiFunctions.deleteAppointment(id);
    loadAppointments();
    loadTodayAppointments && loadTodayAppointments();
    loadRightDayAppointments && loadRightDayAppointments(selectedRightDate);
    fetchCategoryCounts();
  };

  const handleEditAppointment = async () => {
    if (!editingAppointment || !editForm.startTime || !editForm.endTime || !editForm.patientId) {
        setErrorMessage('Tüm alanlar zorunludur.');
        setShowError(true);
        return;
    }
    const payload = {
        title: editForm.title,
        startTime: toZonedTime(editForm.startTime, TIMEZONE).toISOString(),
        endTime: toZonedTime(editForm.endTime, TIMEZONE).toISOString(),
        notes: editForm.notes,
        patientId: editForm.patientId,
    };
    try {
        const updated = await apiFunctions.updateAppointment(editingAppointment.id, payload);
        handleCleanUpEditDialog();
        loadAppointments();
        loadRightDayAppointments(selectedRightDate);
        fetchCategoryCounts();
    } catch (err: any) {
        setErrorMessage(err?.response?.data?.message || 'Bir hata oluştu.');
        setShowError(true);
    }
  };

  const handleCleanUpEditDialog = () => {
    setEditDialogOpen(false);
    setEditingAppointment(null);
    setSearchedPatients([]);
    setEditPatientSearchQuery('');
  };

  const handleDeleteConfirmed = async () => {
    if (!deletingAppointment) return;
    await handleDeleteAppointment(deletingAppointment.id);
    setDeleteDialogOpen(false);
    setDeletingAppointment(null);
  };

  const handleDeleteUserConfirmed = async () => {
    if (!deletingUser) return;
    try {
      await apiFunctions.updateUser(deletingUser.id, { status: 'PASSIVE' });
      setDeleteUserDialogOpen(false);
      setDeletingUser(null);
      loadAllUsers();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || 'Kullanıcı silinirken bir hata oluştu.');
      setShowError(true);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    // Orijinal kullanıcıyı allUsers listesinden bul
    const originalUser = allUsers.find(u => u.id === editingUser.id);
    if (!originalUser) return;
    const payload: any = {};
    if (editingUser.name !== originalUser.name) payload.name = editingUser.name;
    if (editingUser.phoneNumber !== originalUser.phoneNumber) payload.phoneNumber = editingUser.phoneNumber;
    if (editingUser.mail !== originalUser.mail) payload.mail = editingUser.mail;
    if (editingUser.type !== originalUser.type) payload.type = editingUser.type;
    try {
      await apiFunctions.updateUser(editingUser.id, payload);
      setEditUserDialogOpen(false);
      setEditingUser(null);
      loadAllUsers();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || 'Kullanıcı güncellenirken bir hata oluştu.');
      setShowError(true);
    }
  };

  const handleCreatePatient = async () => {
    try {
      await apiFunctions.createPatient(newPatient);
      setNewPatientDialogOpen(false);
      setNewPatient({ name: '', phoneNumber: '', mail: '' });
      // TODO: Patient listesini güncelle (şimdilik boş)
    } catch (err: any) {
      if (err.response && err.response.data && Array.isArray(err.response.data.message)) {
        setErrorMessage(err.response.data.message.join(', '));
        setShowError(true);
      } else {
        setErrorMessage('Bir hata oluştu.');
        setShowError(true);
      }
    }
  };

  const search = async (query: string) => {
    if (query) {
      setIsSearching(true);
      const results = await apiFunctions.searchPatients(query);
      setSearchedPatients(results);
      setIsSearching(false);
    } else {
      setSearchedPatients([]);
    }
  };

  const searchForFilter = async (query: string) => {
    if (query) {
      setIsFilterSearching(true);
      const results = await apiFunctions.searchPatients(query);
      setFilterSearchResults(results);
      setIsFilterSearching(false);
    } else {
      setFilterSearchResults([]);
    }
  };

  const searchAppointmentPatient = async (query: string) => {
    if (query) {
      setAppointmentIsSearching(true);
      const results = await apiFunctions.searchPatients(query);
      setAppointmentSearchedPatients(results);
      setAppointmentIsSearching(false);
    } else {
      setAppointmentSearchedPatients([]);
    }
  };

  const handleOpenEditPatientDialog = (patient: Patient) => {
    setEditingPatient(patient);
    setEditPatientDialogOpen(true);
  };

  const handleOpenDeletePatientDialog = (patient: Patient) => {
    setDeletingPatient(patient);
    setDeletePatientDialogOpen(true);
  };

  const handleUpdatePatient = async () => {
    if (!editingPatient) return;
    const payload = {
        name: editingPatient.name || '',
        phoneNumber: editingPatient.phoneNumber || '',
        mail: editingPatient.mail || ''
    };
    await apiFunctions.updatePatient(editingPatient.id, payload);
    setEditPatientDialogOpen(false);
    setEditingPatient(null);
    // Re-fetch appointments to show updated patient data
    loadAppointments();
    loadRightDayAppointments(selectedRightDate);
    // also refresh search results if any
    if(patientSearchQuery) search(patientSearchQuery);
    if(editPatientSearchQuery) search(editPatientSearchQuery);
    // Tüm Danışanlar dialogu için güncelle
    loadAllPatients();
  };

  const handleDeletePatientConfirmed = async () => {
    if (!deletingPatient) return;
    try {
      await apiFunctions.deletePatient(deletingPatient.id);
      setDeletePatientDialogOpen(false)
      setDeletingPatient(null);
      setSearchedPatients(prev => prev.filter(p => p.id !== deletingPatient.id));
      // Tüm Danışanlar dialogu için güncelle
      loadAllPatients();
    } catch(err: any) {
        setErrorMessage(err?.response?.data?.message || 'Danışan silinemedi. Bu danışana ait randevular olabilir.');
        setShowError(true);
    }
  };

  const handleOpenAllPatientsDialog = async () => {
    const patients = await apiFunctions.getAllPatients();
    setAllPatients(patients);
    setAllPatientsDialogOpen(true);
  };

  const handleCloseAllPatientsDialog = () => {
    setAllPatientsDialogOpen(false);
    setAllPatients([]);
  };

  const handleOpenCategoryDialog = () => {
    setNewCategory({ name: '', type: '' });
    setCategoryDialogOpen(true);
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim() || !newCategory.type.trim()) return;
    await apiFunctions.createCategory(newCategory);
    setCategoryDialogOpen(false);
    loadCategories();
  };

  const handleOpenCategoryListDialog = async () => {
    await loadCategories();
    setCategoryListDialogOpen(true);
  };

  const handleEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setEditCategoryFields({ name: cat.name, type: cat.type });
    setEditCategoryDialogOpen(true);
  };

  const handleCloseEditCategoryDialog = () => {
    setEditCategoryDialogOpen(false);
    setEditingCategory(null);
    setEditCategoryFields({ name: '', type: '' });
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    await apiFunctions.updateCategory(editingCategory.id, editCategoryFields);
    handleCloseEditCategoryDialog();
    loadCategories();
  };

  const handleDeleteCategory = async (id: string) => {
    await apiFunctions.deleteCategory(id);
    loadCategories();
  };

  const handleLogout = () => {
    setLogoutDialogOpen(true);
  };

  const confirmLogout = async () => {
    try {
      // Backend'e logout isteği gönder
      await apiFunctions.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Her durumda token'ı kaldır ve login sayfasına yönlendir
    localStorage.removeItem('token');
    navigate('/login');
    }
  };

  const cancelLogout = () => {
    setLogoutDialogOpen(false);
  };

  function getUserNameFromToken() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.name;
      } catch (error) {
        return 'User';
      }
    }
    return 'User';
  }

  function getUserTypeFromToken() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.type;
      } catch (error) {
        return 'employee';
      }
    }
    return 'employee';
  }

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    return minLength && hasUpperCase && hasNumber;
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.password || !newUser.password2) {
      setUserError('Tüm alanları doldurun.');
      return;
    }

    if (newUser.password !== newUser.password2) {
      setUserError('Şifreler eşleşmiyor.');
      return;
    }

    if (!validatePassword(newUser.password)) {
      setUserError('Şifre en az 8 karakter olmalı, 1 büyük harf ve 1 rakam içermelidir.');
      return;
    }

    try {
      await apiFunctions.createUser(newUser);
      setUserSuccess('Kullanıcı başarıyla oluşturuldu!');
      setNewUser({
        name: '',
        password: '',
        password2: '',
        phoneNumber: '',
        mail: '',
        type: 'employee'
      });
      setShowPassword(false);
      setShowPassword2(false);
      setTimeout(() => {
        setAddUserDialogOpen(false);
        setUserSuccess('');
      }, 2000);
    } catch (err: any) {
      setUserError(err?.response?.data?.message || 'Kullanıcı oluşturulurken bir hata oluştu.');
    }
  };

  const loadAllUsers = async () => {
    try {
      const users = await apiFunctions.getAllUsers();
      setAllUsers(users);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  // Kullanıcılar menüsünü aç
  const handleUsersMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUsersMenuAnchor(event.currentTarget);
  };

  // Kullanıcılar menüsünü kapat
  const handleUsersMenuClose = () => {
    setUsersMenuAnchor(null);
  };

  // Yeni kullanıcı ekleme dialogunu aç
  const handleOpenAddUser = () => {
    handleUsersMenuClose();
    setAddUserDialogOpen(true);
  };

  // Kullanıcıları görüntüleme dialogunu aç
  const handleOpenViewUsers = () => {
    handleUsersMenuClose();
    loadAllUsers();
    setViewUsersDialogOpen(true);
  };

  // Kullanıcı tipine göre renk döndür
  const getUserTypeColor = (type: string) => {
    switch (type) {
      case 'admin':
        return 'error';
      case 'employee':
        return 'primary';
      case 'management':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Kullanıcı tipini Türkçe'ye çevir
  const getUserTypeLabel = (type: string) => {
    switch (type) {
      case 'admin':
        return 'Yönetici';
      case 'employee':
        return 'Çalışan';
      case 'management':
        return 'Yönetim';
      default:
        return type;
    }
  };

  // Filtrelenmiş kullanıcıları getir
  const filteredUsers = allUsers.filter(user =>
    user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    user.mail?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    user.phoneNumber?.includes(userSearchQuery)
  );

  // Ayarlar menüsü fonksiyonları
  const handleSettingsMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsMenuAnchor(event.currentTarget);
  };

  const handleSettingsMenuClose = () => {
    setSettingsMenuAnchor(null);
  };

  const handleOpenChangePassword = () => {
    handleSettingsMenuClose();
    setChangePasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setChangePasswordDialogOpen(true);
  };

  const handleOpenUpdateProfile = async () => {
    handleSettingsMenuClose();
    try {
      const user = await apiFunctions.getCurrentUser();
      setUpdateProfileForm({
        name: user.name || '',
        mail: user.mail || '',
        phoneNumber: user.phoneNumber || ''
      });
    } catch (error) {
      // Token'dan fallback
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUpdateProfileForm({
          name: payload.name || '',
          mail: payload.mail || '',
          phoneNumber: payload.phoneNumber || ''
        });
      } catch (error) {
          setUpdateProfileForm({ name: '', mail: '', phoneNumber: '' });
        }
      } else {
        setUpdateProfileForm({ name: '', mail: '', phoneNumber: '' });
      }
    }
    setUpdateProfileDialogOpen(true);
  };

  const handleChangePassword = async () => {
    if (!changePasswordForm.currentPassword || !changePasswordForm.newPassword || !changePasswordForm.confirmPassword) {
      setErrorMessage('Tüm alanları doldurun.');
      setShowError(true);
      return;
    }

    if (changePasswordForm.newPassword !== changePasswordForm.confirmPassword) {
      setErrorMessage('Yeni şifreler eşleşmiyor.');
      setShowError(true);
      return;
    }

    if (!validatePassword(changePasswordForm.newPassword)) {
      setErrorMessage('Yeni şifre en az 8 karakter olmalı, 1 büyük harf ve 1 rakam içermelidir.');
      setShowError(true);
      return;
    }

    try {
      await apiFunctions.changePassword({
        currentPassword: changePasswordForm.currentPassword,
        newPassword: changePasswordForm.newPassword
      });
      setChangePasswordDialogOpen(false);
      setChangePasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setErrorMessage('Şifreniz başarıyla güncellendi.');
      setShowError(true);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || 'Şifre güncellenirken bir hata oluştu.');
      setShowError(true);
    }
  };

  const handleUpdateProfile = async () => {
    if (!updateProfileForm.name) {
      setErrorMessage('Ad soyad alanı zorunludur.');
      setShowError(true);
      return;
    }
    try {
      await apiFunctions.updateProfile(updateProfileForm);
      setUpdateProfileDialogOpen(false);
      setSuccessMessage('Profil bilgileriniz başarıyla güncellendi!');
      setShowSuccess(true);
      fetchUserName(); // AppBar'daki ismi güncelle
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Profil güncellenirken bir hata oluştu.');
      setShowError(true);
    }
  };

  const loadAllPatients = async () => {
    try {
      const patients = await apiFunctions.getAllPatients();
      setAllPatients(patients);
    } catch (error) {
      console.error('Error loading all patients:', error);
    }
  };

  const fetchUserName = async () => {
    try {
      const user = await apiFunctions.getCurrentUser(); // backend'de mevcut kullanıcıyı dönen bir endpoint olmalı
      setUserName(user.name);
    } catch {
      setUserName(getUserNameFromToken());
    }
  };

  // Randevu tarihinin geçmiş olup olmadığını kontrol eden yardımcı fonksiyon
  const isAppointmentPast = (appointment: Appointment) => {
    if (!appointment.startTime) return false;
    const appointmentDate = new Date(appointment.startTime);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Bugünün başlangıcı
    return appointmentDate < today;
  };

  useEffect(() => {
    fetchUserName();
  }, []);

  const now = new Date();
  const recentPastAppointments = [...appointments]
    .filter(a => new Date(a.startTime) < now)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, 3);

  return (
    <>
      {/* ERROR SNACKBAR */}
      <Snackbar open={showError} autoHideDuration={6000} onClose={() => setShowError(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <MuiAlert onClose={() => setShowError(false)} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </MuiAlert>
      </Snackbar>
      {/* SUCCESS SNACKBAR */}
      <Snackbar open={showSuccess} autoHideDuration={4000} onClose={() => setShowSuccess(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <MuiAlert onClose={() => setShowSuccess(false)} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </MuiAlert>
      </Snackbar>
      {/* APP BAR */}
      <AppBar position="static" sx={{ bgcolor: '#1e293b', boxShadow: 'none' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight={700} sx={{ color: '#fff' }}>
            RandevumBurda.com
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {getUserTypeFromToken() === 'admin' && (
              <>
                <Button 
                  variant="contained" 
                  onClick={handleUsersMenuOpen}
                  sx={{ bgcolor: '#a259d9', color: '#fff', textTransform: 'none', fontWeight: 600, boxShadow: 'none', '&:hover': { bgcolor: '#8b5cf6' } }}
                >
                  Kullanıcılar
                </Button>
                <Menu
                  anchorEl={usersMenuAnchor}
                  open={Boolean(usersMenuAnchor)}
                  onClose={handleUsersMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                >
                  <MenuItem onClick={handleOpenAddUser}>
                    <ListItemIcon>
                      <AddIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Yeni Kullanıcı Ekle</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={handleOpenViewUsers}>
                    <ListItemIcon>
                      <PeopleIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Kullanıcıları Görüntüle</ListItemText>
                  </MenuItem>
                </Menu>
              </>
            )}
            <Button 
              variant="contained" 
              onClick={e => handleSettingsMenuOpen(e)}
              sx={{ bgcolor: '#818cf8', color: '#fff', textTransform: 'none', fontWeight: 600, boxShadow: 'none', '&:hover': { bgcolor: '#6366f1' } }}
            >
              Ayarlar
            </Button>
            <Menu
              anchorEl={settingsMenuAnchor}
              open={Boolean(settingsMenuAnchor)}
              onClose={handleSettingsMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
            >
              <MenuItem onClick={handleOpenUpdateProfile}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Bilgileri Güncelle</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleOpenChangePassword}>
                <ListItemIcon>
                  <SecurityIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Şifre Değiştir</ListItemText>
              </MenuItem>
            </Menu>
            {/* Kullanıcı adı butonu */}
            <Button
              variant="outlined"
              sx={{
                bgcolor: '#1e293b',
                color: '#fff',
                fontWeight: 600,
                borderRadius: 2,
                fontSize: 15,
                px: 2,
                py: 0.5,
                minWidth: 80,
                boxShadow: 'none',
                pointerEvents: 'none',
                cursor: 'default',
                '&:hover': { bgcolor: '#1e293b' },
                textTransform: 'none',
                border: 'none',
              }}
              disableElevation
              disableRipple
            >
              {userName}
            </Button>
            <Button color="inherit" onClick={handleLogout} sx={{ fontWeight: 600, color: '#a259d9', border: '1px solid #a259d9', borderRadius: 2, ml: 2 }}>
              Çıkış Yap
            </Button>
        </Box>
        </Toolbar>
      </AppBar>

      {/* PAGE LAYOUT */}
      <Box sx={{ p: 3, background: '#f8fafc', minHeight: 'calc(100vh - 64px)', width: '100vw', boxSizing: 'border-box' }}>
        <Box sx={{ display: 'flex', gap: 3, width: '100%' }}>
          {/* LEFT PANEL: Calendar & Appointments */}
          <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Appointments */}
            <Paper elevation={2} sx={{ p: { xs: 2, md: 3 }, borderRadius: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ color: '#1e293b' }}>Randevular</Typography>
                <Button 
                  variant="contained" 
                  onClick={handleOpenDialog}
                  sx={{ bgcolor: '#6366f1', color: '#fff', textTransform: 'none', fontWeight: 600, borderRadius: 2, boxShadow: 'none', '&:hover': { bgcolor: '#4f46e5' } }}
                  startIcon={<AddIcon />}
                >
                  Yeni Randevu
                </Button>
      </Box>

              {/* Filter Controls */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                <Autocomplete
                  options={filterSearchResults}
                  getOptionLabel={(option) => option.name}
                  value={selectedFilterPatient}
                  onChange={(event, newValue) => {
                    setSelectedFilterPatient(newValue);
                    setFilterPatientSearchQuery('');
                  }}
                  inputValue={filterPatientSearchQuery}
                  onInputChange={(event, newInputValue) => {
                    setFilterPatientSearchQuery(newInputValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Danışan Ara"
                      sx={{ minWidth: 200, minHeight: 48 }}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <>
                            {isFilterSearching ? <CircularProgress color="inherit" size={16} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
                <FormControl sx={{ minWidth: 160, minHeight: 48 }}>
                  <Select
                    value={selectedFilterCategory || ''}
                    onChange={e => setSelectedFilterCategory(e.target.value || null)}
                    displayEmpty
                    sx={{ minHeight: 48 }}
                  >
                    <MenuItem value=""><em>Kategoriler</em></MenuItem>
                    {categories.map(category => (
                      <MenuItem key={category.id} value={category.name}>{category.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Box sx={{ minWidth: 200, minHeight: 48, display: 'flex', alignItems: 'center' }}>
                  <DatePicker
                    label="Tarih Seçin"
                    value={selectedRightDate}
                    onChange={(newValue) => setSelectedRightDate(newValue)}
                    format="dd/MM/yyyy"
                    slotProps={{
                      textField: {
                        variant: 'outlined',
                        size: 'small',
                        sx: { minHeight: 48 }
                      }
                    }}
                  />
                  {selectedRightDate && (
                    <IconButton size="small" onClick={() => setSelectedRightDate(null)}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </Box>
              {/* APPOINTMENTS TABLE */}
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8 }}>
                  <thead>
                    <tr style={{ background: '#f3f4f6' }}>
                      <th style={{ padding: 12, textAlign: 'left', color: '#6366f1', fontWeight: 700 }}>Tarih & Saat</th>
                      <th style={{ padding: 12, textAlign: 'left', color: '#6366f1', fontWeight: 700 }}>Danışan</th>
                      <th style={{ padding: 12, textAlign: 'left', color: '#6366f1', fontWeight: 700 }}>Kategori</th>
                      <th style={{ padding: 12, textAlign: 'center', color: '#6366f1', fontWeight: 700 }}>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rightDayAppointments.map(appointment => (
                      <>
                        <tr key={appointment.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: 12 }}>
                            {`${format(new Date(appointment.startTime), 'd MMMM', { locale: tr })} - ${format(new Date(appointment.startTime), 'HH:mm', { locale: tr })} - ${format(new Date(appointment.endTime), 'HH:mm', { locale: tr })}`}
                          </td>
                          <td style={{ padding: 12 }}>
                            {appointment.patient?.name || allPatients.find(p => p.id === appointment.patientId)?.name || '-'}
                          </td>
                          <td style={{ padding: 12 }}>
                            <Box>
                              <Typography variant="body2">{appointment.categoryName || '-'}</Typography>
                              {appointment.notes && appointment.notes.trim() !== '' && (
                                <Typography variant="caption" sx={{ color: '#64748b', fontStyle: 'italic', display: 'block', mt: 0.5 }}>
                                  {appointment.notes}
                                </Typography>
                              )}
                            </Box>
                          </td>
                          <td style={{ padding: 12, textAlign: 'center' }}>
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                              <IconButton 
                                size="small" 
                                onClick={() => {
                                  setEditingAppointment(appointment);
                                  setEditForm({
                                    title: appointment.title,
                                    startTime: new Date(appointment.startTime),
                                    endTime: new Date(appointment.endTime),
                                    notes: appointment.notes,
                                    patientId: appointment.patientId || null,
                                    categoryId: appointment.categoryId || null,
                                  });
                                  setEditDialogOpen(true);
                                }}
                                disabled={isAppointmentPast(appointment)}
                                sx={{ color: isAppointmentPast(appointment) ? '#9ca3af' : '#6366f1' }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                onClick={() => {
                                  setDeletingAppointment(appointment);
                                  setDeleteDialogOpen(true);
                                }}
                                disabled={isAppointmentPast(appointment)}
                                sx={{ color: isAppointmentPast(appointment) ? '#9ca3af' : '#ef4444' }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </td>
                        </tr>
                      </>
                    ))}
                  </tbody>
                </table>
                {rightDayAppointments.length === 0 && (
                  <Typography sx={{ color: '#64748b', textAlign: 'center', py: 4 }}>No appointments found for selected filters.</Typography>
                )}
              </Box>
          </Paper>
          </Box>
          {/* RIGHT PANEL: Patients & Categories */}
          <Box sx={{ flex: 1.5, minWidth: 320, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Patients */}
            <Paper elevation={2} sx={{ p: { xs: 2, md: 3 }, borderRadius: 4, mb: 2 }}>
              <Typography variant="h6" fontWeight={700} sx={{ color: '#1e293b', mb: 2 }}>Danışanlar</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Danışan Ara.."
                  value={patientSearchQuery}
                  onChange={e => setPatientSearchQuery(e.target.value)}
                  sx={{ mb: 0 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    )
                  }}
                />
                {/* Arama Sonuçları */}
                {patientSearchQuery && (
                  <Paper elevation={0} sx={{ mt: 0, maxHeight: 200, overflowY: 'auto', border: '1px solid #E5E7EB', borderRadius: 1 }}>
                    {isSearching ? (
                      <Box sx={{ p: 2, textAlign: 'center' }}><CircularProgress size={20} /></Box>
                    ) : searchedPatients.length === 0 ? (
                      <Box sx={{ p: 2, textAlign: 'center', color: '#64748b' }}>No patients found.</Box>
                    ) : (
                      searchedPatients.map((patient) => (
                        <Box
                          key={patient.id}
                          sx={{ p: 1.5, cursor: 'pointer', '&:hover': { backgroundColor: '#F9FAFB' }, display: 'flex', alignItems: 'center', gap: 1 }}
                          onClick={() => handleOpenEditPatientDialog(patient)}
                        >
                          <Avatar sx={{ width: 28, height: 28, bgcolor: '#e0e7ff', color: '#6366f1', fontWeight: 700 }}>
                            <PersonIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ color: '#1F2937' }}>{patient.name}</Typography>
                            <Typography variant="caption" sx={{ color: '#6B7280' }}>{patient.phoneNumber}</Typography>
                          </Box>
                        </Box>
                      ))
                    )}
              </Paper>
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Button variant="contained" sx={{ bgcolor: '#6366f1', color: '#fff', textTransform: 'none', fontWeight: 600, borderRadius: 2, boxShadow: 'none', '&:hover': { bgcolor: '#4f46e5' } }} onClick={handleOpenNewPatientDialog}>
                  Danışan Ekle
                </Button>
                <Button variant="outlined" sx={{ color: '#6366f1', borderColor: '#6366f1', textTransform: 'none', fontWeight: 600, borderRadius: 2 }} onClick={handleOpenAllPatientsDialog}>
                  Tüm Danışanları Görüntüle
                </Button>
              </Box>
              { }
              <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>Son Gelen 3 Danışan</Typography>
              <Box>
                {recentPastAppointments.map(app => (
                  <Box key={app.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#e0e7ff', color: '#6366f1', fontWeight: 700 }}>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {app.patient?.name || allPatients.find(p => p.id === app.patientId)?.name || '-'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                        {format(new Date(app.startTime), 'd MMMM HH:mm', { locale: tr })}
                      </Typography>
                    </Box>
                  </Box>
                ))}
                {recentPastAppointments.length === 0 && <Typography color="text.secondary">No recent past appointments.</Typography>}
            </Box>
          </Paper>
            {/* Categories */}
            <Paper elevation={2} sx={{ p: { xs: 2, md: 3 }, borderRadius: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={700} sx={{ color: '#1e293b' }}>Kategoriler</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="contained" sx={{ bgcolor: '#f472b6', color: '#fff', textTransform: 'none', fontWeight: 600, borderRadius: 2, boxShadow: 'none', '&:hover': { bgcolor: '#ec4899' } }} onClick={handleOpenCategoryDialog}>
                    Kategori Ekle
                  </Button>
                  <Button variant="outlined" sx={{ color: '#f472b6', borderColor: '#f472b6', textTransform: 'none', fontWeight: 600, borderRadius: 2 }} onClick={handleOpenCategoryListDialog}>
                    Hepsini Görüntüle
                  </Button>
                </Box>
              </Box>
              <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>Mevcut Kategoriler</Typography>
              <Box>
                {categories.map(category => {
                  const countObj = categoryCounts.find(c => c.id === category.id);
                  const count = countObj ? countObj.count : 0;
                  return (
                    <Box key={category.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#6366f1', mr: 1 }} />
                      <Typography variant="body2" fontWeight={600}>{category.name} - Bugün {count} Randevu</Typography>
                    </Box>
                  );
                })}
                {categories.length === 0 && <Typography color="text.secondary">Hiç kategori yok.</Typography>}
            </Box>
          </Paper>
          </Box>
        </Box>
      </Box>

      {/* DIALOGS & SNACKBARS: Mevcut dialog ve snackbar kodları burada kalacak */}
      {/* Yeni Randevu Dialogu */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#6366f1', width: 40, height: 40 }}>
              <EventIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Yeni Randevu Oluştur
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Sisteme yeni bir randevu ekleyin
              </Typography>
        </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <EventIcon fontSize="small" />
              Randevu Bilgileri
            </Typography>
            <TextField
              label="Başlık"
              value={newAppointment.title}
              onChange={(e) => setNewAppointment({ ...newAppointment, title: e.target.value })}
              fullWidth
              required
              placeholder="Randevu başlığı girin"
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EventIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <Box display="flex" gap={2}>
              <DateTimePicker
                label="Başlangıç Zamanı"
                value={newAppointment.startTime}
                onChange={(date) => setNewAppointment({ ...newAppointment, startTime: date })}
                ampm={false}
                format="dd/MM/yyyy HH:mm"
                sx={{ width: '100%' }}
                slotProps={{ textField: { variant: 'outlined', margin: 'normal', required: true } }}
              />
              <DateTimePicker
                label="Bitiş Zamanı"
                value={newAppointment.endTime}
                onChange={(date) => setNewAppointment({ ...newAppointment, endTime: date })}
                ampm={false}
                format="dd/MM/yyyy HH:mm"
                sx={{ width: '100%' }}
                slotProps={{ textField: { variant: 'outlined', margin: 'normal', required: true } }}
              />
            </Box>
          </Box>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon fontSize="small" />
              Danışan Seçimi
            </Typography>
            {/* Danışan seçimi inputları ve işlevselliği aynı kalacak */}
            <TextField
              placeholder="Danışan ara..."
              value={appointmentSelectedPatient ? appointmentSelectedPatient.name : appointmentPatientSearchQuery}
              onChange={(e) => {
                setAppointmentPatientSearchQuery(e.target.value);
                setAppointmentSelectedPatient(null);
                setNewAppointment({ ...newAppointment, patientId: null });
              }}
              fullWidth
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    {appointmentIsSearching && <CircularProgress size={20} />}
                    {appointmentSelectedPatient && (
                      <IconButton 
                        size="small" 
                        onClick={() => {
                          setAppointmentSelectedPatient(null);
                          setAppointmentPatientSearchQuery('');
                          setNewAppointment({ ...newAppointment, patientId: null });
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    )}
                  </InputAdornment>
                )
              }}
            />
            {!appointmentSelectedPatient && appointmentSearchedPatients.length > 0 && (
              <Paper 
                elevation={0} 
                sx={{ mt: 1, maxHeight: 200, overflowY: 'auto', border: '1px solid #E5E7EB', borderRadius: 2 }}
              >
                {appointmentSearchedPatients.map((patient) => (
                  <Box
                    key={patient.id}
                    sx={{ p: 1.5, cursor: 'pointer', '&:hover': { backgroundColor: '#F3F4F6' }, display: 'flex', alignItems: 'center', gap: 1 }}
                    onClick={() => {
                      setAppointmentSelectedPatient(patient);
                      setAppointmentPatientSearchQuery('');
                      setAppointmentSearchedPatients([]);
                      setNewAppointment({ ...newAppointment, patientId: patient.id });
                    }}
                  >
                    <Avatar sx={{ width: 28, height: 28, bgcolor: '#e0e7ff', color: '#6366f1', fontWeight: 700 }}>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ color: '#1F2937' }}>{patient.name}</Typography>
                      <Typography variant="caption" sx={{ color: '#6B7280' }}>{patient.phoneNumber}</Typography>
                    </Box>
                  </Box>
                ))}
      </Paper>
            )}
          </Box>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CategoryIcon fontSize="small" />
              Kategori Seçimi
            </Typography>
            <FormControl fullWidth margin="normal">
              <Select
                value={newAppointment.categoryId || ''}
                onChange={(e) => setNewAppointment({ ...newAppointment, categoryId: e.target.value })}
                displayEmpty
                sx={{ borderRadius: 2, fontWeight: 600 }}
                required
              >
                <MenuItem value="" disabled>
                  Kategori seçin
                </MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id} sx={{ fontWeight: 600 }}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <EditIcon fontSize="small" />
              Notlar
            </Typography>
            <TextField
              label="Notlar (Opsiyonel)"
              value={newAppointment.notes}
              onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
              multiline
              rows={3}
              fullWidth
              placeholder="Ek bilgi veya not ekleyin"
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
          <Button onClick={handleCloseDialog} variant="outlined" sx={{ px: 3 }}>
            İptal
          </Button>
          <Button onClick={handleCreateAppointment} variant="contained" sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' }, px: 3 }} startIcon={<EventIcon />}>
            Randevu Oluştur
          </Button>
        </DialogActions>
      </Dialog>

      {/* Yeni Danışan Ekleme Dialogu */}
      <Dialog open={newPatientDialogOpen} onClose={handleCloseNewPatientDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#6366f1', width: 40, height: 40 }}>
              <PersonAddIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Yeni Danışan Ekle
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Sisteme yeni danışan kaydı oluşturun
              </Typography>
            </Box>
            </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon fontSize="small" />
              Kişisel Bilgiler
            </Typography>
            <TextField
              label="Ad Soyad"
              fullWidth
              margin="normal"
              value={newPatient.name}
              onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
              required
              placeholder="Danışanın tam adını girin"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
    </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhoneIcon fontSize="small" />
              İletişim Bilgileri
            </Typography>
            <TextField
              label="Telefon Numarası"
              fullWidth
              margin="normal"
              value={newPatient.phoneNumber}
              onChange={(e) => setNewPatient({...newPatient, phoneNumber: e.target.value})}
              required
              placeholder="+90 5XX XXX XX XX"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="E-posta Adresi"
              type="email"
              fullWidth
              margin="normal"
              value={newPatient.mail}
              onChange={(e) => setNewPatient({...newPatient, mail: e.target.value})}
              placeholder="ornek@email.com"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Bu danışan sisteme kaydedilecek ve randevulara atanabilecek.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
          <Button 
            onClick={handleCloseNewPatientDialog} 
            variant="outlined"
            sx={{ px: 3 }}
          >
            İptal
          </Button>
          <Button 
            onClick={handleCreatePatient} 
            variant="contained"
            disabled={!newPatient.name || !newPatient.phoneNumber}
            sx={{ 
              bgcolor: '#6366f1', 
              '&:hover': { bgcolor: '#4f46e5' },
              px: 3
            }}
            startIcon={<PersonAddIcon />}
          >
            Danışan Ekle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Şifre Değiştir Dialogu */}
      <Dialog open={changePasswordDialogOpen} onClose={handleCloseChangePasswordDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#f59e0b', width: 40, height: 40 }}>
              <SecurityIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Şifre Değiştir
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Güvenliğiniz için şifrenizi güncelleyin
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <SecurityIcon fontSize="small" />
              Mevcut Şifre
            </Typography>
            <TextField
              label="Mevcut Şifre"
              type={showCurrentPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              value={changePasswordForm.currentPassword}
              onChange={(e) => setChangePasswordForm({...changePasswordForm, currentPassword: e.target.value})}
              required
              placeholder="Mevcut şifrenizi girin"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SecurityIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      edge="end"
                    >
                      {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <SecurityIcon fontSize="small" />
              Yeni Şifre
            </Typography>
            <TextField
              label="Yeni Şifre"
              type={showNewPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              value={changePasswordForm.newPassword}
              onChange={(e) => setChangePasswordForm({...changePasswordForm, newPassword: e.target.value})}
              required
              placeholder="En az 8 karakter, 1 büyük harf, 1 rakam"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SecurityIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Yeni Şifre Tekrar"
              type={showConfirmPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              value={changePasswordForm.confirmPassword}
              onChange={(e) => setChangePasswordForm({...changePasswordForm, confirmPassword: e.target.value})}
              required
              placeholder="Yeni şifrenizi tekrar girin"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SecurityIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Şifreniz güvenli bir şekilde hash'lenerek güncellenecektir.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
          <Button 
            onClick={handleCloseChangePasswordDialog} 
            variant="outlined"
            sx={{ px: 3 }}
          >
            İptal
          </Button>
          <Button 
            onClick={handleChangePassword} 
            variant="contained"
            disabled={!changePasswordForm.currentPassword || !changePasswordForm.newPassword || !changePasswordForm.confirmPassword}
            sx={{ 
              bgcolor: '#f59e0b', 
              '&:hover': { bgcolor: '#d97706' },
              px: 3
            }}
            startIcon={<SecurityIcon />}
          >
            Şifreyi Güncelle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bilgileri Güncelle Dialogu */}
      <Dialog open={updateProfileDialogOpen} onClose={handleCloseUpdateProfileDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#10b981', width: 40, height: 40 }}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Bilgileri Güncelle
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Profil bilgilerinizi güncelleyin
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon fontSize="small" />
              Kişisel Bilgiler
            </Typography>
            <TextField
              label="Ad Soyad"
              fullWidth
              margin="normal"
              value={updateProfileForm.name}
              onChange={(e) => setUpdateProfileForm({...updateProfileForm, name: e.target.value})}
              required
              placeholder="Adınızı ve soyadınızı girin"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmailIcon fontSize="small" />
              İletişim Bilgileri
            </Typography>
            <TextField
              label="E-posta Adresi"
              type="email"
              fullWidth
              margin="normal"
              value={updateProfileForm.mail}
              onChange={(e) => setUpdateProfileForm({...updateProfileForm, mail: e.target.value})}
              placeholder="ornek@email.com"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Telefon Numarası"
              fullWidth
              margin="normal"
              value={updateProfileForm.phoneNumber}
              onChange={(e) => setUpdateProfileForm({...updateProfileForm, phoneNumber: e.target.value})}
              placeholder="+90 5XX XXX XX XX"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Bu bilgiler profilinizde güncellenecektir.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
          <Button 
            onClick={handleCloseUpdateProfileDialog} 
            variant="outlined"
            sx={{ px: 3 }}
          >
            İptal
          </Button>
          <Button 
            onClick={handleUpdateProfile} 
            variant="contained"
            disabled={!updateProfileForm.name}
            sx={{ 
              bgcolor: '#10b981', 
              '&:hover': { bgcolor: '#059669' },
              px: 3
            }}
            startIcon={<PersonIcon />}
          >
            Bilgileri Güncelle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Randevu Düzenle Dialogu */}
      <Dialog open={editDialogOpen} onClose={handleCleanUpEditDialog} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#6366f1', width: 40, height: 40 }}>
              <EditIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Randevuyu Düzenle
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Randevu bilgilerini güncelleyin
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Başlık"
            value={editForm.title}
            onChange={e => setEditForm({ ...editForm, title: e.target.value })}
            fullWidth
            margin="normal"
          />
          <Box display="flex" gap={2}>
            <DateTimePicker
              label="Başlangıç Zamanı"
              value={editForm.startTime}
              onChange={date => setEditForm({ ...editForm, startTime: date })}
              sx={{ width: '100%' }}
              slotProps={{ textField: { variant: 'outlined', margin: 'normal', required: true } }}
            />
            <DateTimePicker
              label="Bitiş Zamanı"
              value={editForm.endTime}
              onChange={date => setEditForm({ ...editForm, endTime: date })}
              sx={{ width: '100%' }}
              slotProps={{ textField: { variant: 'outlined', margin: 'normal', required: true } }}
            />
          </Box>
          <TextField
            label="Notlar"
            value={editForm.notes}
            onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
            fullWidth
            margin="normal"
            multiline
            rows={3}
          />
          <FormControl fullWidth margin="normal">
            <Select
              value={editForm.categoryId || ''}
              onChange={e => setEditForm({ ...editForm, categoryId: e.target.value })}
              displayEmpty
              sx={{ borderRadius: 2, fontWeight: 600 }}
              required
            >
              <MenuItem value="" disabled>
                Kategori seçin
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id} sx={{ fontWeight: 600 }}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
          <Button onClick={handleCleanUpEditDialog} variant="outlined" sx={{ borderRadius: 2, px: 3 }}>
            İptal
          </Button>
          <Button onClick={handleEditAppointment} variant="contained" sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' }, borderRadius: 2, px: 3 }} startIcon={<EditIcon />}>
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Randevu Sil Onay Dialogu */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#ef4444', width: 40, height: 40 }}>
              <DeleteIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Randevuyu Sil
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Bu işlem geri alınamaz!
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#ef4444', fontWeight: 500, mt: 1 }}>
            Bu randevuyu silmek istediğinize emin misiniz?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined" sx={{ borderRadius: 2, px: 3 }}>
            İptal
          </Button>
          <Button onClick={handleDeleteConfirmed} variant="contained" sx={{ bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' }, borderRadius: 2, px: 3 }} startIcon={<DeleteIcon />}>
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tüm Danışanları Görüntüle Dialogu */}
      <Dialog open={allPatientsDialogOpen} onClose={handleCloseAllPatientsDialog} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#6366f1', width: 40, height: 40 }}>
              <PeopleIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Tüm Danışanlar
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Sistemde kayıtlı tüm danışanlar
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {allPatients.length === 0 ? (
            <Typography sx={{ color: '#64748b', textAlign: 'center', py: 4 }}>Hiç danışan bulunamadı.</Typography>
          ) : (
            <TableContainer component={Paper} sx={{ boxShadow: 'none', borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: '#f1f5f9' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#6366f1' }}>Ad Soyad</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#6366f1' }}>Telefon</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#6366f1' }}>E-posta</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#6366f1', textAlign: 'center' }}>İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[...allPatients].sort((a, b) => a.name.localeCompare(b.name, 'tr')).map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>{patient.name}</TableCell>
                      <TableCell>{patient.phoneNumber}</TableCell>
                      <TableCell>{patient.mail}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <IconButton size="small" sx={{ color: '#6366f1' }} onClick={() => { setEditingPatient(patient); setEditPatientDialogOpen(true); }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" sx={{ color: '#ef4444' }} onClick={() => { setDeletingPatient(patient); setDeletePatientDialogOpen(true); }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
          <Button onClick={handleCloseAllPatientsDialog} variant="outlined" sx={{ borderRadius: 2, px: 3 }}>
            Kapat
          </Button>
        </DialogActions>
      </Dialog>

      {/* Danışan Düzenle Dialogu */}
      <Dialog open={editPatientDialogOpen && !!editingPatient} onClose={() => { setEditPatientDialogOpen(false); setEditingPatient(null); }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#6366f1', width: 40, height: 40 }}>
              <EditIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>Danışanı Düzenle</Typography>
              <Typography variant="body2" color="textSecondary">Danışan bilgilerini güncelleyin</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Ad Soyad"
            value={editingPatient?.name || ''}
            onChange={e => setEditingPatient(editingPatient ? { ...editingPatient, name: e.target.value } : null)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Telefon"
            value={editingPatient?.phoneNumber || ''}
            onChange={e => setEditingPatient(editingPatient ? { ...editingPatient, phoneNumber: e.target.value } : null)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="E-posta"
            value={editingPatient?.mail || ''}
            onChange={e => setEditingPatient(editingPatient ? { ...editingPatient, mail: e.target.value } : null)}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
          <Button onClick={() => { setEditPatientDialogOpen(false); setEditingPatient(null); }} variant="outlined" sx={{ borderRadius: 2, px: 3 }}>İptal</Button>
          <Button onClick={handleUpdatePatient} variant="contained" sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' }, borderRadius: 2, px: 3 }} startIcon={<EditIcon />}>Kaydet</Button>
        </DialogActions>
      </Dialog>

      {/* Danışan Sil Onay Dialogu */}
      <Dialog open={deletePatientDialogOpen && !!deletingPatient} onClose={() => { setDeletePatientDialogOpen(false); setDeletingPatient(null); }} PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#ef4444', width: 40, height: 40 }}>
              <DeleteIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>Danışanı Sil</Typography>
              <Typography variant="body2" color="textSecondary">Bu işlem geri alınamaz!</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#ef4444', fontWeight: 500, mt: 1 }}>
            Bu danışanı silmek istediğinize emin misiniz?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
          <Button onClick={() => { setDeletePatientDialogOpen(false); setDeletingPatient(null); }} variant="outlined" sx={{ borderRadius: 2, px: 3 }}>İptal</Button>
          <Button onClick={handleDeletePatientConfirmed} variant="contained" sx={{ bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' }, borderRadius: 2, px: 3 }} startIcon={<DeleteIcon />}>Sil</Button>
        </DialogActions>
      </Dialog>

      {/* Yeni Kullanıcı Ekle Dialogu */}
      <Dialog open={addUserDialogOpen} onClose={() => setAddUserDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#a259d9', width: 40, height: 40 }}>
              <PersonAddIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>Yeni Kullanıcı Ekle</Typography>
              <Typography variant="body2" color="textSecondary">Sisteme yeni bir kullanıcı ekleyin</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {userError && <Alert severity="error" sx={{ mb: 2 }}>{userError}</Alert>}
          {userSuccess && <Alert severity="success" sx={{ mb: 2 }}>{userSuccess}</Alert>}
          <TextField
            label="Ad Soyad"
            value={newUser.name}
            onChange={e => setNewUser({ ...newUser, name: e.target.value })}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Telefon"
            value={newUser.phoneNumber}
            onChange={e => setNewUser({ ...newUser, phoneNumber: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="E-posta"
            value={newUser.mail}
            onChange={e => setNewUser({ ...newUser, mail: e.target.value })}
            fullWidth
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <Select
              value={newUser.type}
              onChange={e => setNewUser({ ...newUser, type: e.target.value })}
              displayEmpty
              sx={{ borderRadius: 2, fontWeight: 600 }}
              required
            >
              <MenuItem value="employee">Çalışan</MenuItem>
              <MenuItem value="admin">Yönetici</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Şifre"
            type={showPassword ? 'text' : 'password'}
            value={newUser.password}
            onChange={e => setNewUser({ ...newUser, password: e.target.value })}
            fullWidth
            margin="normal"
            required
            InputProps={{
              endAdornment: (
                <IconButton onClick={() => setShowPassword(v => !v)}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              )
            }}
            helperText="En az 8 karakter, 1 büyük harf ve 1 rakam içermelidir."
          />
          <TextField
            label="Şifre (Tekrar)"
            type={showPassword2 ? 'text' : 'password'}
            value={newUser.password2}
            onChange={e => setNewUser({ ...newUser, password2: e.target.value })}
            fullWidth
            margin="normal"
            required
            InputProps={{
              endAdornment: (
                <IconButton onClick={() => setShowPassword2(v => !v)}>
                  {showPassword2 ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              )
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
          <Button onClick={() => setAddUserDialogOpen(false)} variant="outlined" sx={{ borderRadius: 2, px: 3 }}>İptal</Button>
          <Button onClick={handleAddUser} variant="contained" sx={{ bgcolor: '#a259d9', '&:hover': { bgcolor: '#8b5cf6' }, borderRadius: 2, px: 3 }} startIcon={<PersonAddIcon />}>Kullanıcı Ekle</Button>
        </DialogActions>
      </Dialog>

      {/* Tüm Kullanıcıları Görüntüle Dialogu */}
      <Dialog open={viewUsersDialogOpen} onClose={() => setViewUsersDialogOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#a259d9', width: 40, height: 40 }}>
              <PeopleIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>Tüm Kullanıcılar</Typography>
              <Typography variant="body2" color="textSecondary">Sistemde kayıtlı tüm kullanıcılar</Typography>
            </Box>
            <Box sx={{ flex: 1 }} />
            <Typography variant="body2" sx={{ fontWeight: 600, color: showPassiveUsers ? '#ef4444' : '#10b981', mr: 1 }}>
              {showPassiveUsers ? 'Silinenler' : 'Aktifler'}
            </Typography>
            <Switch
              checked={showPassiveUsers}
              onChange={e => setShowPassiveUsers(e.target.checked)}
              color="primary"
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          {allUsers.length === 0 ? (
            <Typography sx={{ color: '#64748b', textAlign: 'center', py: 4 }}>Hiç kullanıcı bulunamadı.</Typography>
          ) : (
            <TableContainer component={Paper} sx={{ boxShadow: 'none', borderRadius: 2 }}>
              <Table>
   <TableHead>
                  <TableRow sx={{ background: '#f1f5f9' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#a259d9' }}>Ad Soyad</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#a259d9' }}>Telefon</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#a259d9' }}>E-posta</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#a259d9' }}>Tip</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#a259d9' }}>Eklenme Tarihi</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#a259d9', textAlign: 'center' }}>İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[...allUsers]
                    .filter(user => user.status === (showPassiveUsers ? 'PASSIVE' : 'ACTIVE'))
                    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                    .map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.phoneNumber}</TableCell>
                        <TableCell>{user.mail}</TableCell>
                        <TableCell>
                          <Chip label={getUserTypeLabel(user.type)} color={getUserTypeColor(user.type)} size="small" />
                        </TableCell>
                        <TableCell>{user.createdAt ? new Date(user.createdAt).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <IconButton size="small" sx={{ color: '#a259d9' }} onClick={() => { setEditingUser(user); setEditUserDialogOpen(true); }} disabled={user.status !== 'ACTIVE'}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" sx={{ color: '#ef4444' }} onClick={() => { setDeletingUser(user); setDeleteUserDialogOpen(true); }} disabled={user.status !== 'ACTIVE'}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
          <Button onClick={() => setViewUsersDialogOpen(false)} variant="outlined" sx={{ borderRadius: 2, px: 3 }}>
            Kapat
          </Button>
        </DialogActions>
      </Dialog>

      {/* Kullanıcı Düzenle Dialogu */}
      <Dialog open={editUserDialogOpen && !!editingUser} onClose={() => { setEditUserDialogOpen(false); setEditingUser(null); }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#a259d9', width: 40, height: 40 }}>
              <EditIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>Kullanıcıyı Düzenle</Typography>
              <Typography variant="body2" color="textSecondary">Kullanıcı bilgilerini güncelleyin</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Ad Soyad"
            value={editingUser?.name || ''}
            onChange={e => setEditingUser(editingUser ? { ...editingUser, name: e.target.value } : null)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Telefon"
            value={editingUser?.phoneNumber || ''}
            onChange={e => setEditingUser(editingUser ? { ...editingUser, phoneNumber: e.target.value } : null)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="E-posta"
            value={editingUser?.mail || ''}
            onChange={e => setEditingUser(editingUser ? { ...editingUser, mail: e.target.value } : null)}
            fullWidth
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <Select
              value={editingUser?.type || ''}
              onChange={e => setEditingUser(editingUser ? { ...editingUser, type: e.target.value } : null)}
              displayEmpty
              sx={{ borderRadius: 2, fontWeight: 600 }}
              required
            >
              <MenuItem value="employee">Çalışan</MenuItem>
              <MenuItem value="admin">Yönetici</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
          <Button onClick={() => { setEditUserDialogOpen(false); setEditingUser(null); }} variant="outlined" sx={{ borderRadius: 2, px: 3 }}>İptal</Button>
          <Button onClick={handleUpdateUser} variant="contained" sx={{ bgcolor: '#a259d9', '&:hover': { bgcolor: '#8b5cf6' }, borderRadius: 2, px: 3 }} startIcon={<EditIcon />}>Kaydet</Button>
        </DialogActions>
      </Dialog>

      {/* Kullanıcı Sil Onay Dialogu */}
      <Dialog open={deleteUserDialogOpen && !!deletingUser} onClose={() => { setDeleteUserDialogOpen(false); setDeletingUser(null); }} PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#ef4444', width: 40, height: 40 }}>
              <DeleteIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>Kullanıcıyı Sil</Typography>
              <Typography variant="body2" color="textSecondary">Bu işlem geri alınamaz!</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#ef4444', fontWeight: 500, mt: 1 }}>
            Bu kullanıcıyı silmek istediğinize emin misiniz?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
          <Button onClick={() => { setDeleteUserDialogOpen(false); setDeletingUser(null); }} variant="outlined" sx={{ borderRadius: 2, px: 3 }}>İptal</Button>
          <Button onClick={handleDeleteUserConfirmed} variant="contained" sx={{ bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' }, borderRadius: 2, px: 3 }} startIcon={<DeleteIcon />}>Sil</Button>
        </DialogActions>
      </Dialog>

      {/* Kategori Ekle Dialogu */}
      <Dialog open={categoryDialogOpen} onClose={() => setCategoryDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#f472b6', width: 40, height: 40 }}>
              <CategoryIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>Kategori Ekle</Typography>
              <Typography variant="body2" color="textSecondary">Yeni bir kategori oluşturun</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Kategori Adı"
            value={newCategory.name}
            onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Kategori Tipi"
            value={newCategory.type}
            onChange={e => setNewCategory({ ...newCategory, type: e.target.value })}
            fullWidth
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
          <Button onClick={() => setCategoryDialogOpen(false)} variant="outlined" sx={{ borderRadius: 2, px: 3 }}>İptal</Button>
          <Button onClick={async () => {
            try {
              await apiFunctions.createCategory(newCategory);
              setCategoryDialogOpen(false);
              setNewCategory({ name: '', type: '' });
              loadCategories();
            } catch (err) {
              setErrorMessage('Kategori eklenirken bir hata oluştu.');
              setShowError(true);
            }
          }} variant="contained" sx={{ bgcolor: '#f472b6', '&:hover': { bgcolor: '#ec4899' }, borderRadius: 2, px: 3 }} startIcon={<CategoryIcon />}>Kaydet</Button>
        </DialogActions>
      </Dialog>

      {/* Tüm Kategoriler Dialogu */}
      <Dialog open={categoryListDialogOpen} onClose={() => setCategoryListDialogOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#f472b6', width: 40, height: 40 }}>
              <CategoryIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>Tüm Kategoriler</Typography>
              <Typography variant="body2" color="textSecondary">Sistemde kayıtlı tüm kategoriler</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {categories.length === 0 ? (
            <Typography sx={{ color: '#64748b', textAlign: 'center', py: 4 }}>Hiç kategori bulunamadı.</Typography>
          ) : (
            <TableContainer component={Paper} sx={{ boxShadow: 'none', borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: '#f1f5f9' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#f472b6' }}>Kategori Adı</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#f472b6' }}>Tipi</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#f472b6' }}>Eklenme Tarihi</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#f472b6', textAlign: 'center' }}>İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[...categories].sort((a, b) => a.name.localeCompare(b.name, 'tr')).map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell>{cat.name}</TableCell>
                      <TableCell>{cat.type}</TableCell>
                      <TableCell>{cat.createdAt ? new Date(cat.createdAt).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <IconButton size="small" sx={{ color: '#f472b6' }} onClick={() => handleEditCategory(cat)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" sx={{ color: '#ef4444' }} onClick={() => { setEditingCategory(cat); setDeleteCategoryDialogOpen(true); }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
          <Button onClick={() => setCategoryListDialogOpen(false)} variant="outlined" sx={{ borderRadius: 2, px: 3 }}>
            Kapat
          </Button>
        </DialogActions>
      </Dialog>

      {/* Kategori Sil Onay Dialogu */}
      <Dialog open={deleteCategoryDialogOpen && !!editingCategory} onClose={() => { setDeleteCategoryDialogOpen(false); setEditingCategory(null); }} PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#ef4444', width: 40, height: 40 }}>
              <DeleteIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>Kategoriyi Sil</Typography>
              <Typography variant="body2" color="textSecondary">Bu işlem geri alınamaz!</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#ef4444', fontWeight: 500, mt: 1 }}>
            Bu kategoriyi silmek istediğinize emin misiniz?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
          <Button onClick={() => { setDeleteCategoryDialogOpen(false); setEditingCategory(null); }} variant="outlined" sx={{ borderRadius: 2, px: 3 }}>İptal</Button>
          <Button onClick={async () => {
            if (editingCategory) {
              await handleDeleteCategory(editingCategory.id);
              setDeleteCategoryDialogOpen(false);
              setEditingCategory(null);
            }
          }} variant="contained" sx={{ bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' }, borderRadius: 2, px: 3 }} startIcon={<DeleteIcon />}>Sil</Button>
        </DialogActions>
      </Dialog>

      {/* Kategori Düzenle Dialogu */}
      <Dialog open={editCategoryDialogOpen && !!editingCategory} onClose={handleCloseEditCategoryDialog} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#f472b6', width: 40, height: 40 }}>
              <EditIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>Kategoriyi Düzenle</Typography>
              <Typography variant="body2" color="textSecondary">Kategori bilgilerini güncelleyin</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Kategori Adı"
            value={editCategoryFields.name}
            onChange={e => setEditCategoryFields({ ...editCategoryFields, name: e.target.value })}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Kategori Tipi"
            value={editCategoryFields.type}
            onChange={e => setEditCategoryFields({ ...editCategoryFields, type: e.target.value })}
            fullWidth
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
          <Button onClick={handleCloseEditCategoryDialog} variant="outlined" sx={{ borderRadius: 2, px: 3 }}>İptal</Button>
          <Button onClick={handleUpdateCategory} variant="contained" sx={{ bgcolor: '#f472b6', '&:hover': { bgcolor: '#ec4899' }, borderRadius: 2, px: 3 }} startIcon={<EditIcon />}>Kaydet</Button>
        </DialogActions>
      </Dialog>

      {/* Çıkış Yap Onay Dialogu */}
      <Dialog open={logoutDialogOpen} onClose={cancelLogout} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#a259d9', width: 40, height: 40 }}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>Çıkış Yap</Typography>
              <Typography variant="body2" color="textSecondary">Oturumunuzu kapatmak istediğinize emin misiniz?</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
          <Button onClick={cancelLogout} variant="outlined" sx={{ borderRadius: 2, px: 3 }}>İptal</Button>
          <Button onClick={confirmLogout} variant="contained" sx={{ bgcolor: '#a259d9', '&:hover': { bgcolor: '#8b5cf6' }, borderRadius: 2, px: 3 }}>Çıkış Yap</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Dashboard; 