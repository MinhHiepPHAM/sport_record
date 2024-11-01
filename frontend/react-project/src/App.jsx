// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import '@mantine/tiptap/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/core/styles.css';
import '@mantine/charts/styles.css';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import {DEFAULT_THEME, MantineProvider, createTheme, mergeThemeOverrides } from '@mantine/core';
import classes from './css/active.module.css'
import Home from './Home';
import Login from './Login';
import Register from './Register';
import UserProfile from './UserProfile';
import EditProfile from './EditProfile';
import {ActivitySummaryPage} from './Activity';
import AllActivityPage from './AllActivity';
import ActivityDetailPage from './ActivityDetail';
import AllUsersPage from './AllUsers';
import axios from 'axios';
import OneTypeActivityPage from './OneTypeActivity';



const themeOverride = createTheme({
  autoContrast : true,
  luminanceThreshold: 0.66,
  focusRing: 'auto',
  activeClassName: classes.active,
  defaultRadius:'sm',
  cursorType: 'pointer',
  primaryShade:6
})
const myTheme = mergeThemeOverrides(DEFAULT_THEME, themeOverride);

axios.defaults.baseURL = 'http://localhost:8000';

export default function App() {
  return <MantineProvider theme={myTheme}>
    {
      <BrowserRouter>
        <div className="App">
          <main>
            <Routes>
              <Route path="/login" element={<Login/>} />
              <Route path="/signup" element={<Register/>} />
              <Route path="/home" element={<Home/>} />
              <Route path='/users' element={<AllUsersPage/>} />
              <Route path='/users/:uid' element={<UserProfile/>} />
              <Route path='/users/:uid/editprofile' element={<EditProfile/>} />
              <Route path='/users/:uid/activities/summary' element={<ActivitySummaryPage/>} />
              <Route path='/users/:uid/activities/all' element={<AllActivityPage/>} />
              <Route path='/users/:uid/activities/running' element={<OneTypeActivityPage type='running'/>} />
              <Route path='/users/:uid/activities/swimming' element={<OneTypeActivityPage type='swimming'/>} />
              <Route path='/users/:uid/activities/bicycle' element={<OneTypeActivityPage type='bicycle'/>} />
              <Route path='/activities/:aid/detail' element={<ActivityDetailPage/>} />
            </Routes>
          </main>
        </div>
		  </BrowserRouter>
    }</MantineProvider>;
}