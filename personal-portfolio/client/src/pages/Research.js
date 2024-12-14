import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Paper,
  Chip,
  CircularProgress,
  Button
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot
} from '@mui/lab';
import { motion } from 'framer-motion';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  ResponsiveContainer 
} from 'recharts';

const ResearchMetrics = ({ metrics }) => (
  <Box sx={{ height: 300, width: '100%' }}>
    <ResponsiveContainer>
      <RadarChart data={metrics}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis />
        <Radar
          name="Research Metrics"
          dataKey="value"
          stroke="#8884d8"
          fill="#8884d8"
          fillOpacity={0.6}
        />
      </RadarChart>
    </ResponsiveContainer>
  </Box>
);

const ResearchTimeline = ({ research }) => (
  <Timeline position="alternate">
    {research.timeline.map((item, index) => (
      <TimelineItem key={index}>
        <TimelineSeparator>
          <TimelineDot color="primary" />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" component="h3">
              {item.title}
            </Typography>
            <Typography>{item.description}</Typography>
            <Typography variant="caption" color="text.secondary">
              {item.date}
            </Typography>
          </Paper>
        </TimelineContent>
      </TimelineItem>
    ))}
  </Timeline>
);

const ResearchCard = ({ research }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom color="primary">
            {research.title}
          </Typography>
          <Box sx={{ mb: 2 }}>
            {research.keywords.map((keyword, index) => (
              <Chip
                key={index}
                label={keyword}
                size="small"
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
          </Box>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: expanded ? 'unset' : 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: 2
            }}
          >
            {research.abstract}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="subtitle2">Impact Factor:</Typography>
              <Typography variant="body2" color="primary">
                {research.metrics.impact}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2">Citations:</Typography>
              <Typography variant="body2" color="primary">
                {research.metrics.citations}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
        <Box sx={{ mt: 'auto', p: 2 }}>
          <Button
            size="small"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Show Less' : 'Read More'}
          </Button>
          <Button
            size="small"
            color="primary"
            sx={{ ml: 1 }}
            href={research.pdfUrl}
            target="_blank"
          >
            View Paper
          </Button>
        </Box>
      </Card>
    </motion.div>
  );
};

const Research = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [researchData, setResearchData] = useState(null);

  useEffect(() => {
    // هنا سيتم جلب البيانات من ال API
    const fetchData = async () => {
      try {
        // API call simulation
        await new Promise(resolve => setTimeout(resolve, 1500));
        setResearchData({
          publications: [
            {
              title: "Advanced Machine Learning Applications",
              keywords: ["AI", "Deep Learning", "Neural Networks"],
              abstract: "This research explores cutting-edge applications...",
              metrics: { impact: 4.5, citations: 23 },
              timeline: [
                { title: "Initial Research", date: "2023", description: "..." },
                { title: "Methodology Development", date: "2023", description: "..." },
                { title: "Results & Publication", date: "2024", description: "..." }
              ]
            },
            // More research papers...
          ],
          metrics: [
            { subject: "Impact", value: 80 },
            { subject: "Innovation", value: 90 },
            { subject: "Methodology", value: 85 },
            { subject: "Citations", value: 70 },
            { subject: "Relevance", value: 95 }
          ]
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching research data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography 
            variant="h1" 
            component="h1"
            sx={{ 
              textAlign: 'center',
              mb: 2,
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            Research & Publications
          </Typography>
          <Typography 
            variant="h5" 
            component="h2"
            sx={{ 
              textAlign: 'center',
              mb: 6,
              color: 'text.secondary',
              maxWidth: '800px',
              mx: 'auto'
            }}
          >
            Exploring the frontiers of technology and innovation
          </Typography>
        </motion.div>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            centered
          >
            <Tab label="Publications" />
            <Tab label="Metrics & Impact" />
            <Tab label="Timeline" />
          </Tabs>
        </Box>

        {activeTab === 0 && (
          <Grid container spacing={4}>
            {researchData.publications.map((research, index) => (
              <Grid item xs={12} md={6} key={index}>
                <ResearchCard research={research} />
              </Grid>
            ))}
          </Grid>
        )}

        {activeTab === 1 && (
          <Box sx={{ mt: 4 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Research Impact Metrics
              </Typography>
              <ResearchMetrics metrics={researchData.metrics} />
            </Paper>
          </Box>
        )}

        {activeTab === 2 && (
          <Box sx={{ mt: 4 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Research Timeline
              </Typography>
              <ResearchTimeline research={researchData.publications[0]} />
            </Paper>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Research;
