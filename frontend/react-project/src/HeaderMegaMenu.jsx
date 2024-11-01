import {
  Group,
  Button,
  Image,
  useMantineColorScheme,
  ActionIcon,
  useComputedColorScheme,
  Avatar,
  Text,
  Anchor,
} from '@mantine/core';;


import classes from './css/headerMenu.module.css';
import pageLogo from './assets/samuraiX.png'
import cx from 'clsx';
import { IconSun, IconMoon } from '@tabler/icons-react';
import actClasses from './css/actionToggle.module.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


function NotLoggedIn() {
  return (
    <>
      <Button
        href="/login"
        component='a'
        className={classes.authButton}
      >
        Log In
      </Button>
      <Button
        href="/signup"
        className={classes.authButton}
        component='a'
      >
        Register
      </Button>
    </>
  )
}

function LoggedIn({username, uid}) {
  const displayName = username.slice(0,2).toUpperCase()
  const navigate = useNavigate()
  const logoutHandle = (e) =>{
    try {
			axios.post('/logout/', {
				token : localStorage.getItem('token')
			},{
				headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + localStorage.getItem('token')
        }
			});
			// console.log('logout response: ',response.data)
      // console.log('token = ', localStorage.getItem('token'))
			
			localStorage.removeItem('username')
      localStorage.removeItem('token')
      localStorage.removeItem('uid')
      navigate('/login')
		} catch (error) {
			console.error('Logout failed:', error);
		}
  }
  return (
    <>
      <Group gap="sm" className={classes.avatar} component='a' href={'/users/'+uid}>
        <Avatar color="cyan" h={41} w={41} ml={'10px'} radius="xl">{displayName}</Avatar>
        <Text className={classes.text} fz="lg" fw={500} mr={'10px'} >
          {username}
        </Text>
      </Group>
      <Button
        className={classes.authButton}
        onClick={logoutHandle}
      >
        Log Out
      </Button>
    </>
  )
}

export function HeaderMegaMenu({page=''}) {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const [activedPage, setActivedPage] = useState(page);
  const navigate = useNavigate();
  const username = localStorage.getItem('username')
  const uid = localStorage.getItem('uid')
  const isAuthenticated = localStorage.getItem('token') !== null

  let actUrl = (username===undefined)? 'login' : `/users/${uid}/activities/all/`

  const links = [
    { link: '/home', label: 'Home' },
    { link: actUrl, label: 'Activities' },
    { link: '/aboutme', label: 'About me' },
  ]

  const headerItems = links.map((link)=> (
    <a
      key={link.label}
      href={link.link}
      className={classes.link}
      data-active={activedPage === link.label || undefined}
      onClick={ (event) => {
          event.preventDefault()
          setActivedPage(link.label)
          navigate(link.link)
        }
      }
    >
      {link.label}
    </a>
  ));
  return (
    <header className={classes.header}>
      <Group justify="space-between" h="100%">
        <Anchor href='/home'>
          <Image src={pageLogo} h={65} w={65} radius={'50%'}/>
        </Anchor>

        <Group h="100%" gap={0} visibleFrom="sm">
          {headerItems}
        </Group>

        <Group visibleFrom="sm">
          {isAuthenticated ? <LoggedIn username={username} uid={uid}/> : <NotLoggedIn/>}
          <ActionIcon
            onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
            variant="outline"
            h={38} w={38}
            radius={19}
            aria-label="Toggle color scheme"
          >
            <IconSun className={cx(actClasses.icon, actClasses.light)} stroke={1.5} />
            <IconMoon className={cx(actClasses.icon, actClasses.dark)} stroke={1.5} />
          </ActionIcon>
        </Group>
      </Group>
    </header>
  );
}