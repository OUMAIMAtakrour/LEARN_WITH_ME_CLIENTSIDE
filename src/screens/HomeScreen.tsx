import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCourses } from "../hooks/useCourse";
import { useAuthStore } from "../store";
import { useCoursesStore } from "../store/courseStore";

const { width } = Dimensions.get("window");
const MAX_RETRIES = 3; 

export default function HomeScreen({ navigation }) {
  const {
    filteredCourses,
    categories,
    activeCategory,
    isLoading,
    error,
    retryCount,
    fetchAllCourses,
    setActiveCategory,
  } = useCoursesStore();

  const { user } = useAuthStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAllCourses();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchAllCourses]);

  const learningPaths = [
    {
      id: "1",
      title: "Professional English",
      category: "Business",
      icon: "briefcase",
      progress: 65,
      color: ["#667eea", "#764ba2"],
      skills: ["Communication", "Vocabulary"],
      duration: "4 weeks",
    },
    {
      id: "2",
      title: "Advanced Writing",
      category: "Language",
      icon: "pencil",
      progress: 45,
      color: ["#00b4db", "#0083b0"],
      skills: ["Academic", "Research"],
      duration: "6 weeks",
    },
    {
      id: "3",
      title: "Software Development",
      category: "Tech",
      icon: "code-tags",
      progress: 30,
      color: ["#ff6b6b", "#ff9a9e"],
      skills: ["Coding", "Problem Solving"],
      duration: "12 weeks",
    },
  ];

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View>
          <Text style={styles.greeting}>Welcome Back,</Text>
          <Text style={styles.username}>{user?.name || "Guest"}</Text>
        </View>
        <TouchableOpacity style={styles.notificationIcon}>
          <MaterialCommunityIcons name="bell-outline" size={24} color="#333" />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCategoryFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoryContainer}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category}
          onPress={() => setActiveCategory(category)}
          style={[
            styles.categoryChip,
            activeCategory === category && styles.activeCategoryChip,
          ]}
        >
          <Text
            style={[
              styles.categoryText,
              activeCategory === category && styles.activeCategoryText,
            ]}
          >
            {category}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderLearningPaths = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Learning Paths</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pathContainer}
      >
        {learningPaths
          .filter(
            (path) =>
              activeCategory === "All" || path.category === activeCategory
          )
          .map((path, index) => (
            <TouchableOpacity
              key={path.id}
              style={styles.pathCard}
              onPress={() =>
                navigation.navigate("CourseDetails", { id: path.id })
              }
            >
              <LinearGradient
                colors={path.color}
                style={styles.pathCardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.pathCardContent}>
                  <View style={styles.pathHeader}>
                    <View style={styles.pathIconContainer}>
                      <MaterialCommunityIcons
                        name={path.icon}
                        size={24}
                        color="white"
                      />
                    </View>
                    <Text style={styles.pathDuration}>{path.duration}</Text>
                  </View>

                  <Text style={styles.pathTitle}>{path.title}</Text>

                  <View style={styles.pathSkills}>
                    {path.skills.map((skill) => (
                      <View key={skill} style={styles.skillBadge}>
                        <Text style={styles.skillText}>{skill}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.progressContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        { width: `${path.progress}%` },
                      ]}
                    />
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
      </ScrollView>
    </View>
  );

  // const renderLearningPaths = () => (
  //   <View style={styles.sectionContainer}>
  //     <View style={styles.sectionHeader}>
  //       <Text style={styles.sectionTitle}>My Learning Paths</Text>
  //       <TouchableOpacity>
  //         <Text style={styles.seeAllText}>See All</Text>
  //       </TouchableOpacity>
  //     </View>
  //     <ScrollView
  //       horizontal
  //       showsHorizontalScrollIndicator={false}
  //       contentContainerStyle={styles.pathContainer}
  //     >
  //       {learningPaths
  //         .filter(
  //           (path) =>
  //             activeCategory === "All" || path.category === activeCategory
  //         )
  //         .map((path, index) => (
  //           <TouchableOpacity
  //             key={path.id}
  //             style={styles.pathCard}
  //             onPress={() =>
  //               navigation.navigate("CourseDetails", { id: path.id })
  //             }
  //           >
  //             <LinearGradient
  //               colors={path.color}
  //               style={styles.pathCardGradient}
  //               start={{ x: 0, y: 0 }}
  //               end={{ x: 1, y: 0 }}
  //             >
  //               <View style={styles.pathCardContent}>
  //                 <View style={styles.pathHeader}>
  //                   <View style={styles.pathIconContainer}>
  //                     <MaterialCommunityIcons
  //                       name={path.icon}
  //                       size={24}
  //                       color="white"
  //                     />
  //                   </View>
  //                   <Text style={styles.pathDuration}>{path.duration}</Text>
  //                 </View>

  //                 <Text style={styles.pathTitle}>{path.title}</Text>

  //                 <View style={styles.pathSkills}>
  //                   {path.skills.map((skill) => (
  //                     <View key={skill} style={styles.skillBadge}>
  //                       <Text style={styles.skillText}>{skill}</Text>
  //                     </View>
  //                   ))}
  //                 </View>

  //                 <View style={styles.progressContainer}>
  //                   <View
  //                     style={[
  //                       styles.progressBar,
  //                       { width: `${path.progress}%` },
  //                     ]}
  //                   />
  //                 </View>
  //               </View>
  //             </LinearGradient>
  //           </TouchableOpacity>
  //         ))}
  //     </ScrollView>
  //   </View>
  // );

  const getCourseIcon = (category) => {
    const icons = {
      Language: "book-education",
      Business: "presentation",
      Tech: "code-tags",
      Design: "palette",
      Marketing: "bullhorn",
      Science: "flask",
    };
    return icons[category] || "school";
  };

  const renderAllCourses = () => {
    if (isLoading) {
      return (
        <View style={[styles.sectionContainer, styles.loadingContainer]}>
          <ActivityIndicator size="large" color="#6366F1" />
          {retryCount > 0 && (
            <Text style={styles.retryText}>
              Retrying... {retryCount}/{MAX_RETRIES}
            </Text>
          )}
        </View>
      );
    }

    if (error) {
      return (
        <View style={[styles.sectionContainer, styles.errorContainer]}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={48}
            color="#EF4444"
          />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchAllCourses(true)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Courses</Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Courses", { category: "All Courses" })
            }
          >
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {filteredCourses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No courses available</Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.coursesContainer}
          >
            {filteredCourses.map((course) => (
              <TouchableOpacity
                key={course._id}
                style={styles.courseCard}
                onPress={() =>
                  navigation.navigate("CourseDetails", { id: course._id })
                }
              >
                <View style={styles.courseCardHeader}>
                  <View style={styles.courseIconContainer}>
                    <MaterialCommunityIcons
                      name={getCourseIcon(course.category)}
                      size={24}
                      color="#6366F1"
                    />
                  </View>
                  <Text style={styles.coursePrice}>
                    ${course.price || "Free"}
                  </Text>
                </View>
                <Text style={styles.courseTitle} numberOfLines={2}>
                  {course.title}
                </Text>
                <Text style={styles.courseInstructor}>
                  {course.teacher?.name || "Unknown Instructor"}
                </Text>
                <View style={styles.courseStats}>
                  <View style={styles.statGroup}>
                    <View style={styles.statItem}>
                      <MaterialCommunityIcons
                        name="star"
                        size={16}
                        color="#FFC107"
                      />
                      <Text style={styles.statText}>
                        {course.rating || "4.5"}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <MaterialCommunityIcons
                        name="account-group"
                        size={16}
                        color="#6B7280"
                      />
                      <Text style={styles.statText}>
                        {course.students || "0"}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <View style={styles.quickActionsContent}>
        {[
          {
            icon: "book-open",
            title: "Courses",
            color: "#6366F1",
            action: () => navigation.navigate("Courses"),
          },
          {
            icon: "certificate",
            title: "Certificates",
            color: "#10B981",
            action: () => navigation.navigate("Certificates"),
          },
          {
            icon: "account-group",
            title: "Mentors",
            color: "#F43F5E",
            action: () => navigation.navigate("Mentors"),
          },
        ].map((action) => (
          <TouchableOpacity
            key={action.title}
            style={styles.quickActionItem}
            onPress={action.action}
          >
            <View
              style={[
                styles.quickActionIconBg,
                { backgroundColor: `${action.color}20` },
              ]}
            >
              <MaterialCommunityIcons
                name={action.icon}
                size={24}
                color={action.color}
              />
            </View>
            <Text style={styles.quickActionText}>{action.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderHeader()}
      {renderCategoryFilter()}
      {renderLearningPaths()}
      {renderAllCourses()}
      {renderQuickActions()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // ...existing styles
  retryText: {
    marginTop: 10,
    color: "#6366F1",
    fontSize: 14,
  },
  container: {
    flex: 1,
    backgroundColor: "#F4F7FA",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorContainer: {
    padding: 20,
    alignItems: "center",
  },
  errorText: {
    color: "#EF4444",
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: "#6366F1",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: "#718096",
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2D3748",
  },
  seeAllText: {
    color: "#6366F1",
    fontSize: 14,
    fontWeight: "600",
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: 16,
    color: "#718096",
  },
  username: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2D3748",
  },
  notificationIcon: {
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF6B6B",
  },
  categoryContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: "#E2E8F0",
  },
  activeCategoryChip: {
    backgroundColor: "#6366F1",
  },
  categoryText: {
    color: "#4A5568",
    fontWeight: "600",
  },
  activeCategoryText: {
    color: "white",
  },
  pathContainer: {
    paddingHorizontal: 24,
  },
  pathCard: {
    width: width * 0.75,
    marginRight: 16,
    borderRadius: 24,
    overflow: "hidden",
  },
  pathCardGradient: {
    padding: 24,
  },
  pathCardContent: {
    height: 250,
    justifyContent: "space-between",
  },
  pathHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pathIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  pathDuration: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  pathTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
  },
  pathSkills: {
    flexDirection: "row",
  },
  skillBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    marginRight: 8,
  },
  skillText: {
    color: "white",
    fontSize: 12,
  },
  progressContainer: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 3,
    marginTop: 16,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "white",
    borderRadius: 3,
  },
  coursesContainer: {
    paddingHorizontal: 24,
  },
  courseCard: {
    width: width * 0.65,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    marginRight: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  courseCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  courseIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  courseDetails: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2D3748",
    marginBottom: 6,
  },
  courseInstructor: {
    fontSize: 14,
    color: "#718096",
    marginBottom: 10,
  },
  courseStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  statText: {
    fontSize: 13,
    color: "#718096",
    marginLeft: 4,
  },
  coursePrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#6366F1",
    textAlign: "right",
  },
  quickActionsContainer: {
    marginHorizontal: 24,
    backgroundColor: "white",
    borderRadius: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  quickActionsContent: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
  },
  quickActionItem: {
    alignItems: "center",
  },
  quickActionIconBg: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: "#4A5568",
  },
});
