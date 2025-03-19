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
