import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress
} from '@mui/material';
import { motion } from 'framer-motion';

const MLService = ({ title, description, technologies, features, demoAvailable }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleDemo = async () => {
    setLoading(true);
    // هنا سيتم إضافة منطق التجربة الحية
    await new Promise(resolve => setTimeout(resolve, 2000));
    setResult('Demo result will be shown here');
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h5" component="h2" gutterBottom color="primary">
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {description}
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Technologies:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {technologies.map((tech) => (
                <Chip
                  key={tech}
                  label={tech}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
          <Typography variant="subtitle2" gutterBottom>
            Features:
          </Typography>
          <ul>
            {features.map((feature, index) => (
              <li key={index}>
                <Typography variant="body2" color="text.secondary">
                  {feature}
                </Typography>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardActions>
          <Button 
            size="small" 
            color="primary"
            onClick={() => setOpen(true)}
            disabled={!demoAvailable}
          >
            Try Demo
          </Button>
          <Button size="small" color="primary">
            Learn More
          </Button>
        </CardActions>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{title} Demo</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Enter your input here..."
            sx={{ mt: 2 }}
          />
          {loading && (
            <Box sx={{ width: '100%', mt: 2 }}>
              <LinearProgress />
            </Box>
          )}
          {result && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Result:
              </Typography>
              <Typography variant="body1">
                {result}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
          <Button onClick={handleDemo} color="primary" disabled={loading}>
            Run Demo
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

const AIServices = () => {
  const services = [
    {
      title: 'Natural Language Processing',
      description: 'Advanced text analysis and processing using state-of-the-art transformer models.',
      technologies: ['BERT', 'GPT', 'Transformers', 'PyTorch'],
      features: [
        'Text Classification',
        'Named Entity Recognition',
        'Sentiment Analysis',
        'Text Generation'
      ],
      demoAvailable: true
    },
    {
      title: 'Computer Vision',
      description: 'Image and video analysis using deep learning models.',
      technologies: ['CNN', 'YOLO', 'OpenCV', 'TensorFlow'],
      features: [
        'Object Detection',
        'Image Classification',
        'Face Recognition',
        'Video Analysis'
      ],
      demoAvailable: true
    },
    {
      title: 'Time Series Analysis',
      description: 'Predictive analytics and forecasting using machine learning.',
      technologies: ['LSTM', 'Prophet', 'scikit-learn', 'TensorFlow'],
      features: [
        'Forecasting',
        'Anomaly Detection',
        'Pattern Recognition',
        'Trend Analysis'
      ],
      demoAvailable: true
    },
    {
      title: 'Recommendation Systems',
      description: 'Personalized content and product recommendations.',
      technologies: ['Collaborative Filtering', 'Matrix Factorization', 'Deep Learning'],
      features: [
        'Content-based Filtering',
        'Collaborative Filtering',
        'Hybrid Systems',
        'Real-time Recommendations'
      ],
      demoAvailable: true
    }
  ];

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
            AI & Machine Learning Services
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
            Cutting-edge AI solutions for real-world problems
          </Typography>
        </motion.div>

        <Grid container spacing={4}>
          {services.map((service, index) => (
            <Grid item xs={12} md={6} key={index}>
              <MLService {...service} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default AIServices;
