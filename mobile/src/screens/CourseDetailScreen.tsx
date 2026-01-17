import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Linking } from 'react-native';
import { Card, Title, Paragraph, Button, List, Divider } from 'react-native-paper';
import axios from 'axios';
import { API_BASE_URL } from '../../App';

interface Material {
  id: number;
  title: string;
  material_type: string;
  file_url: string;
  file_size?: number;
  duration?: number;
}

interface Lesson {
  id: number;
  title: string;
  description: string;
  order: number;
  materials: Material[];
}

interface Course {
  id: number;
  title: string;
  description: string;
  lessons: Lesson[];
  materials: Material[];
}

export default function CourseDetailScreen({ route, navigation }: any) {
  const { courseId } = route.params;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/courses/${courseId}/`);
      setCourse(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching course:', error);
      setLoading(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const openMaterial = (material: Material) => {
    const url = `${API_BASE_URL.replace('/api', '')}${material.file_url}`;
    Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!course) {
    return (
      <View style={styles.container}>
        <Paragraph>Course not found</Paragraph>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>{course.title}</Title>
          <Paragraph>{course.description || 'No description available'}</Paragraph>
        </Card.Content>
      </Card>

      {course.materials && course.materials.length > 0 && (
        <>
          <Title style={styles.sectionTitle}>Course Materials</Title>
          {course.materials.map((material) => (
            <Card key={material.id} style={styles.materialCard}>
              <Card.Content>
                <Title style={styles.materialTitle}>{material.title}</Title>
                <Paragraph>{material.material_type.toUpperCase()}</Paragraph>
                {material.file_size && (
                  <Paragraph>{formatFileSize(material.file_size)}</Paragraph>
                )}
              </Card.Content>
              <Card.Actions>
                <Button mode="contained" onPress={() => openMaterial(material)}>
                  Open
                </Button>
              </Card.Actions>
            </Card>
          ))}
        </>
      )}

      {course.lessons && course.lessons.length > 0 && (
        <>
          <Title style={styles.sectionTitle}>Lessons</Title>
          {course.lessons.map((lesson) => (
            <Card key={lesson.id} style={styles.lessonCard}>
              <Card.Content>
                <Title style={styles.lessonTitle}>{lesson.title}</Title>
                {lesson.description && (
                  <Paragraph>{lesson.description}</Paragraph>
                )}
                {lesson.materials.length > 0 && (
                  <>
                    <Divider style={styles.divider} />
                    {lesson.materials.map((material) => (
                      <List.Item
                        key={material.id}
                        title={material.title}
                        description={`${material.material_type.toUpperCase()} - ${formatFileSize(material.file_size)}`}
                        right={() => (
                          <Button 
                            mode="outlined" 
                            compact
                            onPress={() => openMaterial(material)}
                          >
                            Open
                          </Button>
                        )}
                      />
                    ))}
                  </>
                )}
              </Card.Content>
            </Card>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginBottom: 16,
  },
  materialCard: {
    marginBottom: 12,
  },
  lessonCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 16,
    fontSize: 20,
    fontWeight: 'bold',
  },
  materialTitle: {
    fontSize: 16,
  },
  lessonTitle: {
    fontSize: 18,
  },
  divider: {
    marginVertical: 12,
  },
});
