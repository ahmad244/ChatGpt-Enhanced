import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import ModelAdmin from './features/Chat/ModelAdmin';
import AnalyticsDashboard from './AnalyticsDashboard';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AdminPanel: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin tabs">
          <Tab label="Models" />
          <Tab label="Analytics" />
        </Tabs>
      </Box>
      <TabPanel value={tabValue} index={0}>
        <ModelAdmin />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <AnalyticsDashboard />
      </TabPanel>
    </Box>
  );
};

export default AdminPanel;