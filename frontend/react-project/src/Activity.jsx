import {
    Box, Button, Container, Divider, Flex, Group, Loader, Modal, MultiSelect,
    NativeSelect, Paper, Table, Text, TextInput, Textarea,
    Title
} from "@mantine/core";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DateInput, DatePicker, DateTimePicker } from "@mantine/dates"
import { useDisclosure } from "@mantine/hooks";
import { HeaderMegaMenu } from "./HeaderMegaMenu";
import axios from "axios";
import { FaRunning, FaSwimmer } from "react-icons/fa";
import classes from './css/activity.module.css'
import { MdDirectionsBike } from "react-icons/md";

const username = localStorage.getItem('username');
const token = localStorage.getItem('token');

const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Token ' + token
};

export function CreateNewActivity(props) {
    const {usernames, setQuery} = props;
    const {uid} = useParams();
    const [title, setTitle] = useState('');
    const [type, setType] = useState('Running');
    const [description, setDescription] = useState('');
    const [start, setStart] = useState(null);
    const [terminate, setTerminate] = useState(null);
    const [users, setUsers] = useState([]);
    const [opened, { open, close }] = useDisclosure(false);
    const createdby = username
    const [error, setError] = useState('');
    const [hasError, setHasError] = useState(false);
    const [emptyTitle, setErrorTitle] = useState(false); 
    const [startNotSet, setErrorStart] = useState(false);
    // const [loaded, setLoaded] = useState(false);

    const handleCreateButton = async (e) => {	
		e.preventDefault();
		try {
			const response = await axios.post(`/users/${uid}/activities/create/`, {
				type,
                title,
                users,
                start,
                terminate,
                description,
                createdby
			},{
				headers: headers
			});

            // console.log(title, type, description, start, terminate, users);
            // setLoaded(true);
            const resetFields = [
                {id: 'activity_title', value: ''},
                {id: 'act_type', value: 'Running'},
                {id: 'act_description', value: ''},
                {id: 'user_participate', value: []},
            ];

            resetFields.map((field) => {
                document.getElementById(field.id).value = field.value;
            })

            setTitle('');
            setType('Running');
            setDescription('');
            setUsers([]);

            setHasError(false);
            setError('');
		} catch (e) {
			console.error('Creation failed:', e);
            setError(e.response.data.error);

            setHasError(true)
            title === '' && setErrorTitle(true);
            start === null && setErrorStart(true);
            // setLoaded(true)
		}
	};

    const newActivity = (
        <Container size={800}>
            <Paper withBorder shadow="md" p={30} radius="md">
                {hasError &&
                <Text c='red' size='md' ta="left" mb='md'>
					{error}
				</Text>} 
                <NativeSelect id="act_type"
                    label='Type' required w={'30%'}
                    data={['Running', 'Swimming', 'Bicycle']}
                    onChange={(e)=> setType(e.target.value)}
                />

                <TextInput id='activity_title'
					mt='md' label="Activity Title" placeholder="Title" required
					onChange={(e) => {
                        setTitle(e.target.value);
                        setErrorTitle(e.target.value === '');
                    }}
                    error={emptyTitle}
				/>
				<Group justify="space-between" mt="md">
                    <DateInput id="act_start"
                        clearable
                        label='Start' w={'40%'} required 
                        valueFormat="DD/MM/YYYY"
                        onChange={(e)=>{
                            if (e!==null) {
                                setStart(e.toUTCString());
                                setErrorStart(false)
                            } else {
                                setStart(null);
                                setErrorStart(true)
                            }  
                        }}
                        error={startNotSet}
                    />
                    <DateInput id='act_terminate'
                        clearable
                        valueFormat="DD/MM/YYYY"
                        label='Terminate' w={'40%'}
                        onChange={(e)=>{
                            if (e!==null) setTerminate(e.toUTCString());
                            else setTerminate(null);
                        }}
                    />
				</Group>
                <Textarea id="act_description"
                    label='Description' mt={'md'} onChange={(e)=>setDescription(e.target.value)}
                />
                <MultiSelect id="user_participate"
                    label="Members"
                    placeholder="Type username"
                    data={usernames}
                    limit={6}
                    searchable
                    clearable
                    onChange={setUsers}
                    onSearchChange={setQuery}
                />
				<Button fullWidth mt="xl" type='submit' onClick={handleCreateButton}>
					Create
				</Button>
			</Paper>
        </Container>
    );

    return (
        <>
            <Modal size={'lg'} opened={opened} onClose={close} title="Create new activity" centered>
                {newActivity}
            </Modal>
            <Group justify="space-between">
                <Button onClick={open} mt={'xl'}>New Activity</Button>
                {/* <Flex direction={'row'} mt={'xl'} gap={'md'} mr={'md'}>
                    <a style={{color:'var(--mantine-color-blue-7)'}} href={`/users/${uid}/activities/running/`}>Running</a>
                    <a style={{color:'var(--mantine-color-blue-7)'}} href={`/users/${uid}/activities/swimming/`}>Swimming</a>
                    <a style={{color:'var(--mantine-color-blue-7)'}} href={`/users/${uid}/activities/bicycle/`}>Bicycle</a>
                    <a style={{color:'var(--mantine-color-blue-7)'}} href={`/users/${uid}/activities/all/`}>All</a>
                </Flex> */}
            </Group>
        </>
    )

};

function ActivitySummary(props) {
    const {uid, runningActivities, swimActivities, bicycleActivities} = props;

    const ActTitle = ({type}) => {
        let ActIcon, viewLink;
        switch(type) {
            case 'Running':
                ActIcon = FaRunning;
                viewLink = 'running';
                break;
            case 'Bicycle':
                ActIcon = MdDirectionsBike;
                viewLink = 'bicycle';
                break;
            case 'Swimming':
                ActIcon = FaSwimmer;
                viewLink = 'swimming';
                break;
            default:
                console.log('type error:', type);

        }

        return (
            <Group justify="space-between" mb={'md'}>
                <Flex direction={'row'}>
                    <ActIcon size={22} color="var(--mantine-color-blue-6)" className={classes.activityIcon}/>
                    <Text ta="left" fz="xl" c='var(--mantine-color-blue-6)'>{type} Activities:</Text>
                </Flex>
                <a style={{color:'var(--mantine-color-blue-5)'}} href={`/users/${uid}/activities/${viewLink}/`}>view all</a>
            </Group>
        );
    };


    const ActivityInfo = ({activitiesInfo}) => {
        const activities = activitiesInfo.map((act,i) => (
            <div key={i}>
                <div style={{textAlign: 'center', marginBottom: '10px'}}>
                    <Title order={4} c='var(--mantine-color-blue-4)'>
                        {act.title}
                    </Title>
                    <Divider></Divider>
                </div>
                <Table ml={'xl'} withRowBorders={false} mt={'md'} mb={'md'}>						
                    <Table.Thead>
                        <Table.Tr justify='center'>
                            <Table.Th w={'10%'}>Start</Table.Th>
                            <Table.Th w={'10%'}>Terminate</Table.Th>
                            <Table.Th w={'10%'}>Distance</Table.Th>
                            <Table.Th w={'10%'}>Calories</Table.Th>
                            <Table.Th>Description</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        <Table.Tr>
                            <Table.Td>{new Date(act.start).toLocaleDateString()}</Table.Td>
                            <Table.Td>{new Date(act.terminate).toLocaleDateString()}</Table.Td>
                            <Table.Td>{act.distance} Km</Table.Td>
                            <Table.Td>{act.distance} Kcals</Table.Td>
                            <Table.Td><Text lineClamp={1}>{act.description}</Text></Table.Td>
                        </Table.Tr>
                    </Table.Tbody>
                </Table>
            </div>
        ));
        return activities;
    };

    const allActivityInfo = [
        {type: 'Running', info: runningActivities},
        {type: 'Bicycle', info: bicycleActivities},
        {type: 'Swimming', info: swimActivities},
    ];

    const renderActivities = allActivityInfo.map((act,i)=> (
        <Paper key={i} withBorder shadow="md" p={30} radius="md" mt={'md'} className={classes.activityBackground}>
            <ActTitle type={act.type} />
            <ActivityInfo activitiesInfo={act.info}/>
        </Paper>
    ));

    return renderActivities;
}

export function ActivitySummaryPage() {
    const {uid} = useParams();
    const [usernames, setUsernames] = useState([]);
    const [runningActs, setRunActivity] = useState([]);
    const [swimmingActs, setSwimActivity] = useState([]);
    const [bicycleActs, setBikeActivity] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [query, setQuery] = useState('')
    const queryParams = new URLSearchParams();

    useEffect(()=>{
        try {
            queryParams.append ('uq', query.toString());
            axios.get(`/users/${uid}/activities/summary/?${queryParams.toString()}`, {headers:headers})
            .then(response => {
                // console.log(response.data);
                setUsernames(response.data['usernames']);
                setRunActivity(response.data['running']);
                setSwimActivity(response.data['swimming']);
                setBikeActivity(response.data['bicycle']);
                setLoaded(true)
                // console.log(response.data);
            }).catch (error => {
                console.log(error);
            });
        } catch (e) {
            console.error('Activity page failed:');
        };

    }, [query]);

    if (!loaded) return (<Loader  ml='50%' mt='10%' color="blue" />);
    // console.log(runningActs);
    
    return (
        <Box h={'100%'}>
            <HeaderMegaMenu/>
            <Box ml={'200px'} mr={'200px'} >
                <CreateNewActivity usernames={usernames} setQuery={setQuery} />
                <ActivitySummary uid={uid} runningActivities={runningActs} swimActivities={swimmingActs} bicycleActivities={bicycleActs} />
            </Box>
            
        </Box>
    )
};

// export default ActivitySummaryPage