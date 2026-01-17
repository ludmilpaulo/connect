import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Card, Title, Paragraph, Button, Avatar, Chip } from 'react-native-paper';
import axios from 'axios';
import { API_BASE_URL } from '../../App';

interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail?: string;
  created_at: string;
}

export default function HomeScreen({ navigation }: any) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/courses/`);
      setCourses(response.data.results || response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Paragraph style={{ marginTop: 16, color: '#64748b' }}>Loading courses...</Paragraph>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.headerTitle}>English Learning Platform</Title>
        <Paragraph style={styles.headerSubtitle}>Master English with interactive courses</Paragraph>
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {courses.length === 0 ? (
          <Card style={styles.emptyCard} mode="elevated">
            <Card.Content style={styles.emptyCardContent}>
              <Paragraph style={styles.emptyText}>
                No courses available yet.{'\n'}Please create courses in the Django admin panel.
              </Paragraph>
            </Card.Content>
          </Card>
        ) : (
          courses.map((course) => (
            <Card 
              key={course.id} 
              style={styles.courseCard}
              mode="elevated"
              onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })}
            >
              <Card.Content>
                <View style={styles.courseHeader}>
                  <Avatar.Text size={48} label={course.title.charAt(0)} style={styles.avatar} />
                  <View style={styles.courseTitleContainer}>
                    <Title style={styles.courseTitle}>{course.title}</Title>
                    <Chip style={styles.chip} textStyle={styles.chipText}>English Course</Chip>
                  </View>
                </View>
                <Paragraph style={styles.courseDescription}>
                  {course.description || 'Start your English learning journey with this comprehensive course.'}
                </Paragraph>
              </Card.Content>
              <Card.Actions style={styles.cardActions}>
                <Button 
                  mode="contained" 
                  onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })}
                  style={styles.learnButton}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                >
                  Start Learning
                </Button>
              </Card.Actions>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#2563eb',
    padding: 24,
    paddingTop: 48,
    paddingBottom: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  emptyCard: {
    marginBottom: 16,
    borderRadius: 16,
  },
  emptyCardContent: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 16,
  },
  courseCard: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: 'white',
  },
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatar: {
    backgroundColor: '#ec4899',
    marginRight: 12,
  },
  courseTitleContainer: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    color: '#1e293b',
  },
  chip: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0e7ff',
    height: 24,
  },
  chipText: {
    fontSize: 12,
    color: '#2563eb',
  },
  courseDescription: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  cardActions: {
    padding: 8,
    paddingTop: 4,
  },
  learnButton: {
    flex: 1,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});
