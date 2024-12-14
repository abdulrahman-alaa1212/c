import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  Button,
  useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const FeatureCard = ({ title, description, icon, to, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <Card
      component={Link}
      to={to}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s',
        textDecoration: 'none',
        '&:hover': {
          transform: 'translateY(-5px)',
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
        {icon}
        <Typography 
          variant="h6" 
          component="h2" 
          sx={{ 
            mt: 2, 
            mb: 1,
            color: 'primary.main',
            fontWeight: 600
          }}
        >
          {title}
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ lineHeight: 1.6 }}
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  </motion.div>
);

const Home = () => {
  const theme = useTheme();

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
              color: 'primary.main',
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            Welcome to My Academic Portfolio
          </Typography>
          <Typography 
            variant="h5" 
            component="h2"
            sx={{ 
              textAlign: 'center',
              mb: 6,
              color: 'text.secondary',
              fontWeight: 400,
              maxWidth: '800px',
              mx: 'auto'
            }}
          >
            Exploring the intersection of research, technology, and innovation
          </Typography>
        </motion.div>

        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={4}>
            <FeatureCard
              title="About Me"
              description="Learn about my academic background, research interests, and professional journey."
              icon={<PersonIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />}
              to="/about"
              delay={0.1}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FeatureCard
              title="Research"
              description="Explore my academic publications, ongoing research projects, and contributions to the field."
              icon={<SchoolIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />}
              to="/research"
              delay={0.2}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FeatureCard
              title="Projects"
              description="View my technical projects, implementations, and practical applications of research."
              icon={<WorkIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />}
              to="/projects"
              delay={0.3}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FeatureCard
              title="AI Services"
              description="Discover how I can help with AI implementation, consulting, and custom solutions."
              icon={<PsychologyIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />}
              to="/ai-services"
              delay={0.4}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FeatureCard
              title="Services"
              description="Professional services including consulting, technical writing, and project collaboration."
              icon={<BusinessCenterIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />}
              to="/services"
              delay={0.5}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Button 
            variant="contained" 
            color="primary"
            size="large"
            component={Link}
            to="/contact"
            sx={{ 
              px: 4, 
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1.1rem'
            }}
          >
            Get in Touch
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Home;
