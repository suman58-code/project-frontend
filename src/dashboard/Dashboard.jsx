import {
  AttachMoney,
  Cancel,
  CheckCircle,
  Close as CloseIcon,
  Dashboard as DashboardIcon,
  Download as DownloadIcon,
  FilterList,
  Home,
  Pending,
  PictureAsPdf,
  Score,
  Work,
} from "@mui/icons-material";
import {
  alpha,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  LinearProgress,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip as MuiTooltip,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import UserDocuments from "../components/UserDocuments";
function Dashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [docsLoading, setDocsLoading] = useState(false);

  // EMI Repayment state
  const [selectedLoanEMIs, setSelectedLoanEMIs] = useState([]);
  const [emiDialogOpen, setEmiDialogOpen] = useState(false);
  const [emiLoading, setEmiLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const theme = useTheme();

  // Status filter options
  const statusFilters = [
    {
      value: "ALL",
      label: "All Statuses",
      icon: <FilterList fontSize="small" />,
    },
    {
      value: "PENDING",
      label: "Pending",
      icon: <Pending color="warning" fontSize="small" />,
    },
    {
      value: "APPROVED",
      label: "Approved",
      icon: <CheckCircle color="success" fontSize="small" />,
    },
    {
      value: "REJECTED",
      label: "Rejected",
      icon: <Cancel color="error" fontSize="small" />,
    },
    {
      value: "DISBURSED",
      label: "Disbursed",
      icon: <AttachMoney color="primary" fontSize="small" />,
    },
  ];

  // Prepare data for charts
  const getStatusData = () => {
    const statusCounts = applications.reduce(
      (acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      },
      { PENDING: 0, APPROVED: 0, REJECTED: 0, DISBURSED: 0 }
    );
    return [
      {
        name: "Pending",
        value: statusCounts.PENDING,
        color: theme.palette.warning.main,
      },
      {
        name: "Approved",
        value: statusCounts.APPROVED,
        color: theme.palette.success.main,
      },
      {
        name: "Rejected",
        value: statusCounts.REJECTED,
        color: theme.palette.error.main,
      },
      {
        name: "Disbursed",
        value: statusCounts.DISBURSED,
        color: theme.palette.primary.main,
      },
    ].filter((item) => item.value > 0);
  };

  // Monthly data (dynamic from applications)
  const getMonthlyData = () => {
    const monthly = {};
    applications.forEach((app) => {
      const date = new Date(app.createdAt || app.applicationDate);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      if (!monthly[key])
        monthly[key] = { applications: 0, approved: 0, month: key };
      monthly[key].applications += 1;
      if (app.status === "APPROVED" || app.status === "DISBURSED")
        monthly[key].approved += 1;
    });
    return Object.values(monthly).sort((a, b) =>
      a.month.localeCompare(b.month)
    );
  };

  // Loan purpose bar chart
  const getPurposeData = () => {
    const purposeSums = applications.reduce((acc, app) => {
      acc[app.purpose] = (acc[app.purpose] || 0) + Number(app.loanAmount);
      return acc;
    }, {});
    return Object.keys(purposeSums).map((purpose) => ({
      purpose,
      amount: purposeSums[purpose],
    }));
  };

  // Filter applications based on search and status filter
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.purpose?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    if (!user.id || !user.role) {
      setError("User not logged in or invalid session");
      setLoading(false);
      toast.error("Please log in to view your dashboard");
      return;
    }
    fetchApplications();
    // eslint-disable-next-line
  }, []);

  // Fetch applications
  const fetchApplications = async () => {
    setLoading(true);
    try {
      const endpoint =
        user.role === "ADMIN"
          ? "http://localhost:8732/api/loans/all"
          : `http://localhost:8732/api/loans/user/${user.id}`;
      const response = await axios.get(endpoint);
      setApplications(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to load applications";
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  // Fetch documents for a specific application
  const fetchDocuments = async (app) => {
    const applicationId = app.applicationId;
    if (!applicationId) {
      toast.error("Application ID not found.");
      setSelectedDocs([]);
      setPdfDialogOpen(true);
      return;
    }
    setDocsLoading(true);
    setPdfDialogOpen(true);
    try {
      const response = await axios.get(
        `http://localhost:8732/api/loans/documents/application/${applicationId}`
      );
      setSelectedDocs(response.data || []);
    } catch (e) {
      setSelectedDocs([]);
      toast.error("Failed to load documents");
    } finally {
      setDocsLoading(false);
    }
  };

  // Status update handler (admin)
  const handleStatusUpdate = async (applicationId, status) => {
    try {
      await axios.put(
        `http://localhost:8732/api/loans/update-status/${applicationId}`,
        null,
        { params: { status: status.toUpperCase() } }
      );
      toast.success(`Application ${status.toLowerCase()}!`);
      fetchApplications();
    } catch (error) {
      toast.error(error.response?.data?.message || "Status update failed");
    }
  };

  // Disburse loan (admin)
  const handleDisburse = async (applicationId) => {
    try {
      const application = applications.find(
        (app) => app.applicationId === applicationId
      );
      await axios.post(
        `http://localhost:8732/api/disbursements/disburse/${applicationId}`,
        null,
        { params: { amount: application.loanAmount } }
      );
      toast.success("Loan disbursed!");
      fetchApplications();
    } catch (error) {
      toast.error(error.response?.data?.message || "Disbursement failed");
    }
  };

  // --- EMI Repayment Logic ---
  const fetchEMIs = async (applicationId) => {
    setEmiLoading(true);
    setEmiDialogOpen(true);
    try {
      const response = await axios.get(
        `http://localhost:8732/api/repayments/loan/${applicationId}`
      );
      setSelectedLoanEMIs(response.data || []);
    } catch (e) {
      setSelectedLoanEMIs([]);
      toast.error("Failed to load EMI schedule");
    } finally {
      setEmiLoading(false);
    }
  };

  const handlePayEmi = async (repaymentId, applicationId) => {
    try {
      await axios.post(
        `http://localhost:8732/api/repayments/pay/${repaymentId}`
      );
      toast.success("EMI paid successfully!");
      fetchEMIs(applicationId); // Refresh EMI list
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to pay EMI");
    }
  };

  // Format date without date-fns
  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: theme.palette.background.default,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 400, textAlign: "center", p: 4 }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            style={{ display: "inline-block" }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: theme.palette.primary.main,
                mb: 3,
              }}
            >
              <DashboardIcon fontSize="large" />
            </Avatar>
          </motion.div>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Loading Your Dashboard
          </Typography>
          <LinearProgress color="primary" />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: theme.palette.background.default,
        }}
      >
        <Paper
          sx={{
            p: 4,
            maxWidth: 500,
            textAlign: "center",
            borderRadius: 4,
            boxShadow: theme.shadows[10],
          }}
        >
          <Typography variant="h5" color="error" gutterBottom>
            Dashboard Error
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {typeof error === "string"
              ? error
              : "Failed to load dashboard data"}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={fetchApplications}
            sx={{ borderRadius: 3, px: 4 }}
          >
            Try Again
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          theme.palette.mode === "light"
            ? "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)"
            : theme.palette.background.default,
        pb: 8,
      }}
    >
      <ToastContainer />
      {/* --- CHARTS SECTION --- */}
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Box sx={{ mb: 4 }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 1,
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                display: "inline-block",
              }}
            >
              {user.role === "ADMIN" ? "Admin Dashboard" : "My Loan Dashboard"}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {formattedDate}
            </Typography>
          </motion.div>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Status Pie Chart */}
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                height: "100%",
                boxShadow: theme.shadows[2],
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Application Status
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={getStatusData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {getStatusData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          {/* Monthly Trends Area Chart */}
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                height: "100%",
                boxShadow: theme.shadows[2],
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Monthly Trends
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart
                  data={getMonthlyData()}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={theme.palette.divider}
                  />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="applications"
                    stackId="1"
                    stroke={theme.palette.primary.main}
                    fill={theme.palette.primary.light}
                  />
                  <Area
                    type="monotone"
                    dataKey="approved"
                    stackId="2"
                    stroke={theme.palette.success.main}
                    fill={theme.palette.success.light}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          {/* Loan Purpose Bar Chart */}
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                height: "100%",
                boxShadow: theme.shadows[2],
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Loan Amount by Purpose
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={getPurposeData()}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={theme.palette.divider}
                  />
                  <XAxis dataKey="purpose" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="amount" fill={theme.palette.info.main} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>

        {/* --- USER DOCUMENT UPLOAD & VIEW SECTION (as a component) --- */}
        <UserDocuments userId={user.id} />

        {/* --- APPLICATIONS SECTION --- */}
        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            background: theme.palette.background.paper,
            boxShadow: theme.shadows[2],
            mb: 4,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Loan Applications
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                sx={{ borderRadius: 3 }}
              >
                Filter
              </Button>
              {user.role !== "ADMIN" && (
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ borderRadius: 3 }}
                  href="/apply-loan"
                >
                  New Application
                </Button>
              )}
            </Box>
          </Box>

          {/* Filter Menu */}
          <Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={() => setFilterAnchorEl(null)}
            PaperProps={{
              elevation: 3,
              sx: {
                mt: 1,
                minWidth: 200,
                borderRadius: 3,
              },
            }}
          >
            {statusFilters.map((filter) => (
              <MenuItem
                key={filter.value}
                selected={statusFilter === filter.value}
                onClick={() => {
                  setStatusFilter(filter.value);
                  setFilterAnchorEl(null);
                }}
              >
                <ListItemIcon>{filter.icon}</ListItemIcon>
                <ListItemText>{filter.label}</ListItemText>
              </MenuItem>
            ))}
          </Menu>

          {filteredApplications.length === 0 ? (
            <Box
              sx={{
                p: 8,
                textAlign: "center",
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.action.hover, 0.05),
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No applications found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchQuery
                  ? "Try a different search term"
                  : statusFilter !== "ALL"
                  ? "No applications with this status"
                  : "You have no applications yet"}
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              <AnimatePresence>
                {filteredApplications.map((app) => (
                  <Grid item xs={12} sm={6} md={4} key={app.applicationId}>
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ y: -5 }}
                    >
                      <Card
                        sx={{
                          borderRadius: 3,
                          height: "100%",
                          borderLeft: `4px solid ${
                            app.status === "APPROVED"
                              ? theme.palette.success.main
                              : app.status === "REJECTED"
                              ? theme.palette.error.main
                              : app.status === "DISBURSED"
                              ? theme.palette.primary.main
                              : theme.palette.warning.main
                          }`,
                          boxShadow: theme.shadows[1],
                          transition: "all 0.3s ease",
                          "&:hover": {
                            boxShadow: theme.shadows[4],
                          },
                        }}
                      >
                        <CardContent>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mb: 2,
                            }}
                          >
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 600,
                                color: theme.palette.text.primary,
                              }}
                            >
                              {app.name}
                            </Typography>
                            <Chip
                              label={app.status}
                              size="small"
                              sx={{
                                borderRadius: 2,
                                fontWeight: 500,
                                backgroundColor:
                                  app.status === "APPROVED"
                                    ? alpha(theme.palette.success.main, 0.1)
                                    : app.status === "REJECTED"
                                    ? alpha(theme.palette.error.main, 0.1)
                                    : app.status === "DISBURSED"
                                    ? alpha(theme.palette.primary.main, 0.1)
                                    : alpha(theme.palette.warning.main, 0.1),
                                color:
                                  app.status === "APPROVED"
                                    ? theme.palette.success.main
                                    : app.status === "REJECTED"
                                    ? theme.palette.error.main
                                    : app.status === "DISBURSED"
                                    ? theme.palette.primary.main
                                    : theme.palette.warning.main,
                              }}
                            />
                          </Box>

                          <Stack spacing={1.5} sx={{ mb: 2 }}>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Work
                                sx={{
                                  mr: 1,
                                  color: theme.palette.text.secondary,
                                  fontSize: 20,
                                }}
                              />
                              <Typography variant="body2">
                                {app.profession}
                              </Typography>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Home
                                sx={{
                                  mr: 1,
                                  color: theme.palette.text.secondary,
                                  fontSize: 20,
                                }}
                              />
                              <Typography variant="body2">
                                {app.purpose}
                              </Typography>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <AttachMoney
                                sx={{
                                  mr: 1,
                                  color: theme.palette.text.secondary,
                                  fontSize: 20,
                                }}
                              />
                              <Typography variant="body2">
                                ₹{Number(app.loanAmount).toLocaleString()}
                              </Typography>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Score
                                sx={{
                                  mr: 1,
                                  color: theme.palette.text.secondary,
                                  fontSize: 20,
                                }}
                              />
                              <Typography variant="body2">
                                Credit Score: {app.creditScore}
                              </Typography>
                            </Box>
                          </Stack>

                          {/* Admin actions */}
                          {user.role === "ADMIN" && (
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 1,
                                mt: 2,
                              }}
                            >
                              <MuiTooltip
                                title="View all user-submitted PDFs"
                                arrow
                              >
                                <Button
                                  variant="outlined"
                                  startIcon={<PictureAsPdf />}
                                  onClick={async () => {
                                    await fetchDocuments(app);
                                  }}
                                  sx={{
                                    borderRadius: 2,
                                    textTransform: "none",
                                    mb: 1,
                                    background:
                                      "linear-gradient(90deg, #f8fafc 0%, #e0e7ef 100%)",
                                  }}
                                  color="secondary"
                                >
                                  View Documents
                                </Button>
                              </MuiTooltip>
                              {app.status === "PENDING" && (
                                <Box sx={{ display: "flex", gap: 1 }}>
                                  <Button
                                    variant="contained"
                                    color="success"
                                    size="small"
                                    onClick={() =>
                                      handleStatusUpdate(
                                        app.applicationId,
                                        "APPROVED"
                                      )
                                    }
                                    sx={{
                                      borderRadius: 2,
                                      flex: 1,
                                      textTransform: "none",
                                    }}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    onClick={() =>
                                      handleStatusUpdate(
                                        app.applicationId,
                                        "REJECTED"
                                      )
                                    }
                                    sx={{
                                      borderRadius: 2,
                                      flex: 1,
                                      textTransform: "none",
                                    }}
                                  >
                                    Reject
                                  </Button>
                                </Box>
                              )}
                              {app.status === "APPROVED" && (
                                <Button
                                  variant="contained"
                                  color="primary"
                                  size="small"
                                  onClick={() =>
                                    handleDisburse(app.applicationId)
                                  }
                                  sx={{
                                    borderRadius: 2,
                                    width: "100%",
                                    textTransform: "none",
                                  }}
                                >
                                  Disburse Loan
                                </Button>
                              )}
                            </Box>
                          )}

                          {/* USER EMI REPAYMENT BUTTON */}
                          {user.role !== "ADMIN" &&
                            app.status === "DISBURSED" && (
                              <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                sx={{ borderRadius: 2, mt: 1 }}
                                onClick={() => fetchEMIs(app.applicationId)}
                              >
                                View/Pay EMIs
                              </Button>
                            )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </AnimatePresence>
            </Grid>
          )}
        </Paper>

        {/* PDF Dialog for Application */}
        <Dialog
          open={pdfDialogOpen}
          onClose={() => setPdfDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              p: 2,
              background: "linear-gradient(120deg, #f8fafc 0%, #e0e7ef 100%)",
            },
          }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <PictureAsPdf color="error" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Application Documents
              </Typography>
            </Stack>
            <IconButton onClick={() => setPdfDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {docsLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
                <CircularProgress />
              </Box>
            ) : selectedDocs.length === 0 ? (
              <Typography>No documents found.</Typography>
            ) : (
              selectedDocs.map((doc, idx) => (
                <Box
                  key={doc.downloadUrl || idx}
                  sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}
                >
                  <PictureAsPdf color="error" sx={{ fontSize: 32 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 600 }}>
                      {doc.fileName || doc.documentType || "PDF Document"}
                      <Chip
                        label={doc.documentType}
                        size="small"
                        color="info"
                        sx={{ ml: 1, fontWeight: 500 }}
                      />
                    </Typography>
                  </Box>
                  <MuiTooltip title="Open PDF in new tab" arrow>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      sx={{ mr: 1, borderRadius: 2 }}
                      onClick={() =>
                        window.open(
                          `http://localhost:8732${doc.downloadUrl}`,
                          "_blank"
                        )
                      }
                    >
                      View
                    </Button>
                  </MuiTooltip>
                  <MuiTooltip title="Download PDF" arrow>
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="small"
                      sx={{ borderRadius: 2 }}
                      href={`http://localhost:8732${doc.downloadUrl}`}
                      target="_blank"
                      startIcon={<DownloadIcon />}
                    >
                      Download
                    </Button>
                  </MuiTooltip>
                </Box>
              ))
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setPdfDialogOpen(false)}
              sx={{ borderRadius: 2 }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* --- EMI Dialog for Users --- */}
        <Dialog
          open={emiDialogOpen}
          onClose={() => setEmiDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>EMI Schedule</DialogTitle>
          <DialogContent dividers>
            {emiLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
                <CircularProgress />
              </Box>
            ) : selectedLoanEMIs.length === 0 ? (
              <Typography>No EMIs found.</Typography>
            ) : (
              selectedLoanEMIs.map((emi) => (
                <Box
                  key={emi.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                    p: 1,
                    borderRadius: 2,
                    background: emi.status === "PAID" ? "#e0ffe0" : "#fffbe0",
                  }}
                >
                  <Typography>
                    EMI #{emi.emiNumber} - Due: {emi.dueDate} - Amount: ₹
                    {emi.emiAmount}
                  </Typography>
                  <Chip
                    label={emi.status}
                    color={
                      emi.status === "PAID"
                        ? "success"
                        : emi.status === "OVERDUE"
                        ? "error"
                        : "warning"
                    }
                    sx={{ mr: 2 }}
                  />
                  {emi.status === "PENDING" && (
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handlePayEmi(emi.id, emi.applicationId)}
                    >
                      Pay EMI
                    </Button>
                  )}
                </Box>
              ))
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEmiDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default Dashboard;
