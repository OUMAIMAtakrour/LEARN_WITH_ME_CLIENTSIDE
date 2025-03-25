import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
  mutation Login {
    login(input: { email: $email, password: $password }) {
      access_token
      refresh_token
    }
  }
`;

export const LOGIN_MUTATION_WITH_VARIABLES = gql`
  mutation Login($email: String!, $password: String!) {
    login(input: { email: $email, password: $password }) {
      access_token
      refresh_token
    }
  }
`;

export const SIGNUP_MUTATION = gql`
  mutation Signup($input: SignupInput!, $profileImage: Upload) {
    signup(input: $input, profileImage: $profileImage) {
      _id
      name
      email
      role
      profileImageUrl
      points
    }
  }
`;

export const CREATE_COURSE = gql`
  mutation CreateCourse($input: CreateCourseInput!, $courseImage: Upload) {
    createCourse(input: $input, courseImage: $courseImage) {
      _id
      title
      description
      price
      courseImageUrl
      category
      level
      teacher {
        _id
        name
      }
    }
  }
`;

export const UPDATE_COURSE = gql`
  mutation UpdateCourse($id: ID!, $input: UpdateCourseInput!) {
    updateCourse(id: $id, input: $input) {
      _id
      title
      description
      price
      category
      level
    }
  }
`;

export const ENROLL_IN_COURSE = gql`
  mutation EnrollInCourse($input: CreateCourseProgressInput!) {
    createCourseProgress(input: $input) {
      _id
      userId
      courseId
      completed
      videosProgress {
        videoId
        watchedSeconds
        completed
      }
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_VIDEO_PROGRESS = gql`
  mutation UpdateVideoProgress($input: UpdateVideoProgressInput!) {
    updateVideoProgress(input: $input) {
      _id
      videoId
      watchedSeconds
      completed
    }
  }
`;

export const GET_COMPLETED_COURSES = gql`
  query GetCompletedCourses {
    myCompletedCourses
  }
`;

export const MARK_COURSE_COMPLETE = gql`
  mutation MarkCourseComplete($courseId: String!) {
    markCourseAsCompleted(courseId: $courseId) {
      _id
      userId
      courseId
      completed
      completedAt
      videosProgress {
        videoId
        watchedSeconds
        completed
      }
    }
  }
`;
