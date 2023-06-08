# code-replay
EHR Fair Assessment Tool

## Getting code started
1. Install [`yarn`](https://classic.yarnpkg.com/lang/en/docs/install/), a package manage alternative to npm (that's safer, faster).
1. Get the `config.ts` file and add to `/src`. This has config for firebase and react-redux-firebase.
2. Install dependencies with `yarn install`.
3. Run the code with `yarn start`.
4. You should be able to see the site running on localhost:3000.

## Deploy code
1. Ensure all relevant changes have been committed and pushed to GitHub and that you are on branch `prod`.
2. Run `yarn build` to build the app for production
3. Deploy to firebase (TODO: more info)

## Key Libraries
- Typescript for strictly typed JS
- Yarn for package management
- React (v17.0.2)
- Firebase (v9, compatability version) for auth, database, and deployment
- Redux (v4.1.2) for middleware
- [Redux Toolkit v1.7.1](https://redux-toolkit.js.org/) for Redux development
- [react-redux-firebase v3.11.0](http://react-redux-firebase.com/) for Redux bindings for Firebase and Higher Order Components for use with React
- [MUI (Material UI) v5.7](https://mui.com/material-ui/getting-started/installation/) for styled components
- [react-router-dom v6.3] for routing

## Notes

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

Project managers are Benji Xie (@bxie) and Amy Ko (@amyjko). This is a research project out of the University of Washington Information School.