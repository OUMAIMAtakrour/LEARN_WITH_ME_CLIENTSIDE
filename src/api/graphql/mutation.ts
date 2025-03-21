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
