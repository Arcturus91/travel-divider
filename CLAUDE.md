# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` - Run development server
- `npm run build` - Build the Next.js application
- `npm run lint` - Run ESLint to check code quality
- `npm run build:lambda` - Build AWS Lambda functions
- `npm run deploy:dev` - Deploy to dev environment using SAM
- `npm run deploy:staging` - Deploy to staging environment
- `npm run deploy:prod` - Deploy to production environment

## Coding Standards

- **TypeScript**: Use strict typing; no `any` types unless necessary
- **Naming**: PascalCase for components/interfaces; camelCase for functions/variables
- **Imports**: Group by: 1) React/Next, 2) External libraries, 3) Internal modules with @/ alias
- **Components**: Functional components with proper TypeScript interfaces
- **Error handling**: Use try/catch with specific error messages and appropriate status codes
- **AWS**: Use @aws-sdk/\* modules for AWS services integration
- **Formatting**: Follow Next.js/ESLint core-web-vitals conventions
- **API Routes**: Implement proper error handling with meaningful error messages
- **Code comments**: Use JSDoc style comments for functions and interfaces
