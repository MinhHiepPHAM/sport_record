import { Avatar, Badge, Box, Button, Divider, Flex, Grid, Group, Paper, Table, Text, UnstyledButton, em, useMantineColorScheme } from "@mantine/core";
import { IconSettings, IconUser, IconActivity, IconMessage, IconMessageCircle } from "@tabler/icons-react";
import classes from './css/userProfile.module.css'
import { Link, useParams } from "react-router-dom";
import { useViewportSize } from "@mantine/hooks";
import { HeaderMegaMenu } from "./HeaderMegaMenu";
import { GiPositionMarker } from "react-icons/gi";
import { IoPersonCircle } from "react-icons/io5";
import { BsBagDash } from "react-icons/bs";
import axios from "axios";
import { useEffect, useState } from "react";
import { FaRunning } from "react-icons/fa";
import { FaSwimmer } from "react-icons/fa";
import { MdDirectionsBike } from "react-icons/md";
import { FaAward } from "react-icons/fa6";
import { GiTrophyCup } from "react-icons/gi";

export function UserInfoHeader(props) {
	const {username, firstName, lastName, avatar, city, country, title} = props;
	const displayName = username.slice(0,2).toUpperCase();
	let avatarPhoto;
	if (avatar==='') {
		avatarPhoto = (
			<Avatar
				size={150}
				radius={120}
				// mx="auto"
			>
				{displayName}
			</Avatar>
		)
	} else {
		const avaLink = `http://localhost:8000/avatar/${username}/${username}.jpg`;
		avatarPhoto = (<Avatar
			size={150}
			radius={120}
			src={avaLink}
		/>)
	}

	return (
		<Paper withBorder p='lg' radius='md' className={classes.userInfo}>
			{avatarPhoto}
			<Text ta="center" fz="lg" fw={500} mt="md">
			{firstName} {lastName}
			</Text>
				<div className={classes.mainUserInner}>
					<BsBagDash size={18} className={classes.mainLinkIcon} /><Text ta="left" c="var(--mantine-color-gray-6)" fz="sm">{title}</Text>
				</div>
				<div className={classes.mainUserInner}>
					<GiPositionMarker size={18} className={classes.mainLinkIcon}/><Text ta="left" c="var(--mantine-color-gray-6)" fz="sm">{city}, {country}</Text>
				</div>

			<Button variant="default" fullWidth mt="md">
				<IconMessageCircle size={22} className={classes.messIcon} />
					<span style={{fontWeight:"normal"}}>Send Message</span>
			</Button>
		</Paper>
	);
}

export const NavbarUser = (props) => {
	const {numAct, numMess, uid} = props;
	const links = [
		{ icon: IconUser, label: 'Profile', href:`/users/${uid}/`},
		{ icon: IconActivity, label: 'Activities', num: numAct, href:`/users/${uid}/activities/all`},
		{ icon: IconMessage, label: 'Message', num: numMess },
		{ icon: IconSettings, label: 'Settings' },
	];

	const mainLinks = links.map((link) => (
		<UnstyledButton key={link.label} className={classes.mainLink}>
			<div className={classes.mainLinkInner}>
				<link.icon size={22} className={classes.mainLinkIcon} />
				<span>{link.label}</span>
			</div>
			{link.num && (
				<Badge size="sm" variant="filled" className={classes.mainLinkBadge}>
					{link.num}
				</Badge>
			)}
		</UnstyledButton>
	));
	return mainLinks;
}

const UserInfo = (props) => {
	const {
		email, firstName, lastName,
		telephone, street, streetNumber, city, country
	} = props;
	// console.log(props)

	const profileData = [
		{ name: 'First Name', value: firstName},
		{ name: 'Last Name', value: lastName},
		{ name: 'Email', value: email},
		{ name: 'Telephone', value: telephone},
		{ name: 'Address', value: `${streetNumber}, ${street} ${city}, ${country}`},
		
	];

	return (
		<Table ml={'42px'}>
			{
				profileData.map((data) => (
				<Table.Tbody key={data.name}>
					<Table.Tr>
						<Table.Td maw={'150px'} miw={'100px'} className={classes.profileFieldValue}>{data.name}</Table.Td>
						<Table.Td className={classes.profileFieldValue}>{data.value}</Table.Td>
					</Table.Tr>
				</Table.Tbody>
				))
			}
		</Table>
	)
}

function ActivitiesView(props) {
	const {uid} = props;
	const [activities, setActivities] = useState([])
	const [loaded, setLoaded] = useState(false);

	const headers = {
		'Content-Type': 'application/json',
		'Authorization': 'Token ' + localStorage.getItem('token')
	};

	useEffect(()=> {
		axios.get(`/users/${uid}/activities/recent/`, {headers:headers})
		.then(response => {
			setActivities(response.data.activities);
			setLoaded(true)
		}).catch (error => {
			console.log(error)
		})
	}, []);

	activities.map((act)=> {
		switch(act.type) {
			case 'RUN':
				act.icon = FaRunning;
				break;
			case 'BIKE':
				act.icon = MdDirectionsBike;
				break;
			case 'SWIM':
				act.icon = FaSwimmer;
				break;
			default:
				act.icon = FaRunning;
		}
	}) 

	const activityRows = activities.map((act) => (
		<Table.Tr key={act.id}>
			<Table.Td>
				<act.icon
					size={18} className={classes.mainLinkIcon} color={'var(--mantine-color-blue-7)'}
					title={act.type}
				/>
			</Table.Td>
			<Table.Td>{act.title}</Table.Td>
			<Table.Td>{act.distance}</Table.Td>
			<Table.Td>{new Date(act.updated).toLocaleDateString()}</Table.Td>
			<Table.Td><Text lineClamp={1} title={act.description}>{act.description}</Text></Table.Td>
		</Table.Tr>
	));

	const recentActivities = (
		<Paper withBorder p='lg' radius='md' ml='md' className={classes.userInfo}>
			<Group justify="space-between" mb={'md'}>
				<div className={classes.activityTitle}>
					<IconActivity size={22} className={classes.mainLinkIcon}/>
					<Text ta="left" fz="lg" c='var(--mantine-color-blue-6)'>Recent Activities:</Text>
				</div>
				<a color='var(--mantine-color-blue-5)' href={`/users/${uid}/activities/all/`}>view all</a>
			</Group>
			{(activities.length > 0) && <Table ml={'xl'} withRowBorders={false} >						
				<Table.Thead>
					<Table.Tr justify='center'>
						<Table.Th>Type</Table.Th>
						<Table.Th>Title</Table.Th>
						<Table.Th>Distance</Table.Th>
						<Table.Th>Last update</Table.Th>
						<Table.Th>Description</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{activityRows}
				</Table.Tbody>
			</Table>}
			{(activities.length === 0) && <Text ta={'center'}>There is no activity</Text>}
			
		</Paper>
		
	);

	return recentActivities;
}

function AwardView(props) {
	const {uid} = props;
	const goldAward = [
		{title: 'Company running challenge in 2024', type: 'RUN', distance: '100km', icon: FaRunning},
		{title: 'Software team swimming challenge in 2023', type: 'SWIM', distance:'25km', icon: FaSwimmer},
	];

	const silverAward = [
		{title: 'Company Bicycle', type: 'BIKE', distance: '150km', icon: MdDirectionsBike},
		{title: 'January Running', type: 'SWIM', distance:'25km', icon: FaSwimmer},
	];

	const copperAward = [
		{title: 'Juine running', type: 'RUN', distance: '100km', icon: FaRunning},
		{title: 'September Swimming', type: 'SWIM', distance:'25km', icon: FaSwimmer},
	];

	const iconColor = (level) => {
		let color;
		switch(level) {
			case 'GOLD':
				color = 'gold';
				break;
			case 'SILVER':
				color = 'silver';
				break;
			case 'COPPER':
				color = 'brown'
				break;
			default:
				console.log('level error:', level);
		}
		return color;
	}

	const allAwards = [
		{level:'GOLD', awards: goldAward}, 
		{level:'SILVER', awards: silverAward}, 
		{level:'COPPER', awards: copperAward}, 
	];

	const awardViews = (
		allAwards.map((awards,key)=> (
			<Paper key={key} withBorder p='lg' radius='md' ml='md' w={'30%'} h={'200px'} className={classes.recentAward}>
				<div style={{justifyContent: 'center', display:'flex', marginBottom:'15px'}}>
					<GiTrophyCup color={iconColor(awards.level)} size={30}/>
				</div>
				{awards.awards.map((award) => (
					<Flex key={award.title} direction={'row'}>
						<award.icon size={18} color={iconColor(awards.level)}/>
						<Text ta="left" ml={'xs'} maw={'90%'} style={{overflow:'auto'}}>{award.title}: {award.distance}</Text>
					</Flex>
				))}

			</Paper>
		))	
	);

	const recentAwards = (
		<div>
			<Paper withBorder p='lg' radius='md' ml='md' mt='md' className={classes.userInfo}>
				<Group justify="space-between" h="85%">
					<Flex direction={'row'}>
						<FaAward size={22} className={classes.mainLinkIcon}/>
						<Text ta="left" fz="lg" mb={'md'} c='var(--mantine-color-blue-6)'>Recent Awards:</Text>
					</Flex>
					<a color='var(--mantine-color-blue-5)' href={`/users/${uid}/awards/`}>view all</a>
				</Group>
				<Group justify="space-between">
					{awardViews}
				</Group>
			</Paper>
		</div>
	);

	return recentAwards;

}

function UserProfile() {
	const {uid} = useParams();
	const accountName = localStorage.getItem('username')
	const {colorScheme} = useMantineColorScheme()
	// console.log('theme:', colorScheme)
    const token = localStorage.getItem('token')
	const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [avatar, setAvatar] = useState('');
    const [telephone, setTelephone] = useState('');
    const [bio, setBio] = useState('');
    const [street, setStreet] = useState('');
    const [streetNumber, setStreetNumber] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');
    const [title, setJobTilte] = useState('');
	const [username, setUsername] = useState('');
	// const [isActive, setActive] = useState(true);
    // const [success, setSuccess] = useState(false);

	const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Token ' + token
    };

    useEffect(()=> {
        axios.get(`/users/${uid}/`, {headers:headers})
            .then(response => {
                // setData(response.data)
                setFirstName(response.data['first_name']);
                setLastName(response.data['last_name']);
                setAvatar(response.data['avatar']);
				setCountry(response.data['country']);
                setJobTilte(response.data['job_title']);
                setTelephone(response.data['telephone']);
                setBio(response.data['bio']);
                setStreet(response.data['street']);
                setStreetNumber(response.data['street_number']);
                setCity(response.data['city']);
                setCountry(response.data['country']);
                setJobTilte(response.data['job_title']);
				// setActive(response.data['is_active']);
				setEmail(response.data['email']);
				setUsername(response.data['username']);
                // setSuccess(true);

            }).catch (error => {
                console.log(error);
            });
		},[]);  

	// const { height, width } = useViewportSize();

	return (
		<Box h={'100%'}>
			<HeaderMegaMenu/>
			<Box ml={'200px'} mr={'200px'} >
				<div className={classes.mainContainer} >
					<nav className={classes.navbar} >
						<div className={classes.section}>
							<NavbarUser numAct={5} numMess={6}  uid={uid}/>
						</div>
					</nav>
					<div>
						<Flex direction={'row'} ml={'xl'} gap={'md'} align={'center'} justify={'center'}>
							<div className={classes.userContainer}>
								<UserInfoHeader
									username={username} firstName={firstName} lastName={lastName}
									avatar={avatar} city={city} country={country} title={title}
								/>
							</div>
							<Flex direction={'column'} align="flex-start" w='100%'>
								{(bio !== '<p></p>' && bio != '') &&
									<Paper withBorder p='md' radius='md' ml='xl' mt='md' v={'100%'} className={classes.userInfo}>
										<div className={classes.profileAbout} dangerouslySetInnerHTML={{ __html: bio }} />
									</Paper>
								}
								{(bio === '<p></p>' || bio === '') && 
									<Paper ml='md' mb='md' align='center' w={'100%'}>
										<Text>Add your bio</Text>
									</Paper>
								}
								<UserInfo
									email={email} firstName={firstName}
									lastName={lastName}
									telephone={telephone} street={street} streetNumber={streetNumber}
									city={city} country={country}
								/>

								{(accountName === username) && <Button
									href={'/users/' + uid.toString() + '/editprofile'} component="a"
									variant="default" fw={'normal'} mt={'10px'} ml={'50px'}
								>
									Edit profile
								</Button>}
							</Flex>
						</Flex>
						<Divider my="xs" labelPosition="center" mt={'30px'}
								label={<span style={{color: colorScheme === 'light' ? "var(--mantine-color-dark-2)" : "var(--mantine-color-dark-1)"}}>Summary</span>}
								color={colorScheme === 'light' ? "var(--mantine-color-gray-3)": "var(--mantine-color-dark-4)"}
						/>

						<ActivitiesView uid={uid}/>
						<AwardView/>
					</div>
				</div>
			</Box>	
		</Box>
	);
}

export default UserProfile


