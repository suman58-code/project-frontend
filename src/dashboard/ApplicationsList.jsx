import React from "react";
import {
  Paper,
  Box,
  Typography,
  Grid,
  InputAdornment,
  MenuItem,
  TextField,
  Fade,
} from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
// If you don't have @mui/lab Skeleton, use a Box as a placeholder:
const Skeleton = ({ height }) => (
  <Box sx={{ height, borderRadius: 2, background: "#f0f0f0", opacity: 0.7 }} />
);
import ApplicationCard from "../dashboard/ApplicationCard";

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "DISBURSED", label: "Disbursed" },
  { value: "REJECTED", label: "Rejected" },
  { value: "CLOSED", label: "Closed" },
];

function ApplicationsList({
  applications,
  loading,
  error,
  user,
  onFetchDocuments,
  onFetchEMIs,
  setStatusFilter,
  statusFilter,
  setSearchQuery,
  searchQuery,
  onApprove = () => {},
  onReject = () => {},
  loadingAction,
}) {
  return (
    <Paper
      sx={{
        p: { xs: 2, md: 4 },
        borderRadius: 4,
        mb: 4,
        background: "rgba(255, 255, 255, 0.90)",
        boxShadow: 6,
        backdropFilter: "blur(4px)",
      }}
      elevation={0}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", md: "center" },
          gap: 2,
          mb: 3,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
          Loan Applications
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            size="small"
            variant="outlined"
            placeholder="Search by name or purpose"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              "aria-label": "search applications",
            }}
            sx={{ minWidth: 180, background: "#f5f7fa", borderRadius: 2 }}
          />
          <TextField
            size="small"
            select
            variant="outlined"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FilterListIcon color="action" />
                </InputAdornment>
              ),
              "aria-label": "filter by status",
            }}
            sx={{ minWidth: 160, background: "#f5f7fa", borderRadius: 2 }}
          >
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>
      {!loading && !error && applications.length > 0 && (
        <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
          {applications.length} application{applications.length > 1 ? "s" : ""} found
        </Typography>
      )}
      {loading ? (
        <Fade in>
          <Grid container spacing={3}>
            {[...Array(3)].map((_, idx) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={idx}>
                <Skeleton height={220} />
              </Grid>
            ))}
          </Grid>
        </Fade>
      ) : error ? (
        <Box sx={{ textAlign: "center", p: 6 }}>
          <ErrorOutlineIcon color="error" sx={{ fontSize: 48, mb: 2 }} />
          <Typography color="error" variant="h6">
            {error}
          </Typography>
        </Box>
      ) : applications.length === 0 ? (
        <Box sx={{ p: 8, textAlign: "center", borderRadius: 2 }}>
          <SentimentDissatisfiedIcon
            color="disabled"
            sx={{ fontSize: 56, mb: 1 }}
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No applications found
          </Typography>
        </Box>
      ) : (
        <Fade in>
          <Grid container spacing={3}>
            {applications.map((app) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={app.applicationId}>
                <ApplicationCard
                  app={app}
                  user={user}
                  onFetchDocuments={onFetchDocuments}
                  onFetchEMIs={onFetchEMIs}
                  onApprove={onApprove}
                  onReject={onReject}
                  loadingAction={loadingAction}
                />
              </Grid>
            ))}
          </Grid>
        </Fade>
      )}
    </Paper>
  );
}

export default ApplicationsList;
