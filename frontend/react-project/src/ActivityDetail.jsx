import { 
    Avatar,
    Box, 
    Button, 
    Container, 
    Divider, 
    Flex, 
    Group, 
    Loader,
    Modal,
    MultiSelect,
    NumberInput,
    Paper,
    Select,
    Table,
    Text,
    Title,
    Tooltip,
} from "@mantine/core";
import { HeaderMegaMenu } from "./HeaderMegaMenu";
import { useEffect, useState, Suspense } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { DateInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import classes from './css/activity.module.css'
import { FaRunning, FaSwimmer } from "react-icons/fa";
import { MdDirectionsBike } from "react-icons/md";
import { BarChart } from '@mantine/charts';


const token = localStorage.getItem('token');
const username = localStorage.getItem('username');

const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Token ' + token
};

function CreateNewAction() {
    const {aid} = useParams();
    const [opened, { open, close }] = useDisclosure(false);
    const [distance, setDistance] = useState(null);
    const [date, setDate] = useState(null);
    const [error, setError] = useState('');
    const [hasError, setHasError] = useState(false);
    const [emptyDate, setEmptyDate] = useState(false);
    const [emptyDistance, setEmptyDistance] = useState(false);

    const handleCreateButton = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`/activities/${aid}/create/`,{
                date,
                distance,
                username,
            }, {
                headers: headers
            });
            setDistance(null);
            setHasError(false);
            setError('');
        } catch (e) {
            setError(e.response.data.error);
            setHasError(true);
            (distance===null || distance === '') && setEmptyDistance(true);
            date === null && setEmptyDate(true);
        }
    };

    const newAction = (
        <Modal size={'md'} opened={opened} onClose={close} title="Create new activity record" centered>
            <Container size={600}>
                <Paper withBorder shadow="md" p={30} radius="md">
                    {hasError &&
                    <Text c='red' size='md' ta="left" mb='md'>
                        {error}
                    </Text>}

                    <NumberInput id="act_distance"
                        label='Distance (Km)'
                        placeholder="Enter your Km day gain"
                        allowDecimal={false}
                        onChange={(e)=> {
                            setDistance(e);
                            setEmptyDistance(distance === '');
                        }}
                        min={1}
                        error={hasError&&emptyDistance}
                    />

                    <DateInput id="action_date"
                        clearable mt={'lg'}
                        label='Date'
                        valueFormat="DD/MM/YYYY"
                        onChange={(e)=>{
                            if (e!==null) {
                                setDate(e.toUTCString());
                                setEmptyDate(false)
                            } else {
                                setDate(null);
                                setEmptyDate(true)
                            }  
                        }}
                        error={emptyDate}
                    />

                    <Button fullWidth mt="xl" type='submit' onClick={handleCreateButton}>
                        Create
                    </Button>

                </Paper>
            </Container>
        </Modal>
        
    );
    return (
        <>
            {newAction}
            <Button onClick={open} mt={'xl'} variant="default">New Record</Button>

        </>
    )
}

function AddUser(props) {
    const {aid, users, setQuery} = props;
    const [newUsers, setNewUsers] = useState([]);
    const [opened, { open, close }] = useDisclosure(false);
    const [status, setStatus] = useState(null)
    
    const handleAddButton = async(e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`/activities/${aid}/adduser/`, {
				newUsers
			},{
				headers: headers
			});
            setStatus(response.status);
        } catch (e) {
            console.error('Creation failed:', e);
        }

    }

    return (
        <>
            <Modal size={'lg'} opened={opened} onClose={close} title="Add user to the activity" centered>
                {/* {(error!=='') && <Text c='red' size='md' ta="left" mb='md'>{error}</Text>} */}
                {(status===201) && <Text c='blue' size='md' ta="left" mb='md'>Successfully add user</Text>}
                <MultiSelect id="user_participate"
                        placeholder="Username"
                        data={users}
                        searchable
                        clearable
                        onChange={setNewUsers}
                        onSearchChange={setQuery}
                        
                />
                <Button mt={'md'} type="submit" onClick={handleAddButton}>Add</Button>
            </Modal>
            <Button onClick={open} mt={'xl'} ml={'md'} variant="default" >Add User</Button>
        </>
    )
}

function ActivityInfoTable({activity}) {
    let ActIcon;
    switch(activity.type) {
        case 'RUN':
            ActIcon = FaRunning;
            break;
        case 'BIKE':
            ActIcon = MdDirectionsBike;
            break;
        case 'SWIM':
            ActIcon = FaSwimmer;
            break;
        default:
            console.log('type error:', activity.type);
    }

    const userInActivity = (
        <Avatar.Group>
            {activity.users.slice(0,3).map((user, i)=> (
                <a key={i} href={`/users/${user.id}`}><Avatar src={user.avatar} title={user.username}/></a>
            ))}
            {activity.users.length>3 && <Tooltip
                withArrow
                label = {activity.users.slice(3,activity.users.length).map((u,j)=>(
                    <div key={j}>{u.username}</div>
                ))}
        
            >
                <Avatar>+{activity.users.length-3}</Avatar>
            </Tooltip>
            }
        </Avatar.Group>

    );
    

    const activityDetail = (
        <>
            <div style={{ textAlign: 'center', marginBottom: '10px'}}>
                    <Title order={4} c='var(--mantine-color-blue-4)' mt={'xl'} mb={'xs'}>
                        {activity.title}
                    </Title>
                <Divider></Divider>
            </div>
            <div style={{display:'flex', justifyContent:'center'}}>
                <Table withRowBorders={false} mt={'md'} mb={'md'}>						
                    <Table.Tbody>
                        <Table.Tr justify='center'>
                            <Table.Th>Type</Table.Th>
                            <Table.Th>Users</Table.Th>
                            <Table.Th>Start</Table.Th>
                            <Table.Th>Terminate</Table.Th>
                            <Table.Th>Last update</Table.Th>
                            <Table.Th>Distance</Table.Th>
                            <Table.Th>Description</Table.Th>
                        </Table.Tr>
                    </Table.Tbody>
                    <Table.Tbody>
                        <Table.Tr>
                            <Table.Td><ActIcon size={20} className={classes.activityIcon}/></Table.Td>
                            <Table.Td>{userInActivity}</Table.Td>
                            <Table.Td>{new Date(activity.start).toLocaleDateString()}</Table.Td>
                            <Table.Td>{new Date(activity.terminate).toLocaleDateString()}</Table.Td>
                            <Table.Td>{new Date(activity.updated).toLocaleDateString()}</Table.Td>
                            <Table.Td>{activity.distance} Km</Table.Td>
                            <Table.Td><Text lineClamp={1} title={activity.description}>{activity.description}</Text></Table.Td>
                        </Table.Tr>
                    </Table.Tbody>
                </Table>
            </div>

        </>
    );
    return activityDetail;
}

function UserActionInActivity(props) {
    const {aid} = props; 
    const [totalDistancePerUserAll, setTotalDistancePerUser] = useState([]);
    const [totalDistancePerUserWeek, setTotalDistancePerUserWeek] = useState(null);
    const [totalDistancePerUserMonth, setTotalDistancePerUserMonth] = useState(null);
    const [distancePerUserPerDayAll, setDistancePerUserPerDayAll] = useState(null) ;
    const [selectedUser, setSelectedUser] = useState(username);
    const [loaded, setLoaded] = useState(false);
    const [distancePerUserPerDayByWeek, setDistancePerUserPerDayByWeek] = useState(null);
    const [distancePerUserPerDayByMonth, setDistancePerUserPerDayByMonth] = useState(null);
    const [weekNum, setWeekNum] = useState(null);
    const [month, setMonth] = useState(null);
    const [timestamp, setTimestamp ] = useState('All');
    const [userWeekNum, setUserWeekNum] = useState(null);
    const [userTimestamp, setUserTimestamp ] = useState('All');
    const [userMonth, setUserMonth] = useState(null);
    const [allMonth, setAllMonth] = useState(null);
    const [allWeek, setAllWeek] = useState(null);

    useEffect(()=> {
        axios.get(`/activities/${aid}/detail/usersaction/`, {headers:headers})
        .then(response => {
            setTotalDistancePerUser(response.data.total_distance_per_user_all);
            setTotalDistancePerUserWeek(response.data.total_distance_per_user_by_week);
            setTotalDistancePerUserMonth(response.data.total_distance_per_user_by_month);
            setDistancePerUserPerDayAll(response.data.distance_per_user_per_day);
            setDistancePerUserPerDayByWeek(response.data.distance_per_user_per_day_week);
            setDistancePerUserPerDayByMonth(response.data.distance_per_user_per_day_month);
            setAllWeek(response.data['weeks']);
            setAllMonth(response.data['months']);
            const initWeek = allWeek ? allWeek.slice(-1)[0] : undefined
            setWeekNum(initWeek); 
            setUserWeekNum(initWeek);
            const initMonth = allMonth ? allMonth.slice(-1)[0] : undefined
            setUserMonth(initMonth);
            setMonth(initMonth);
            setLoaded(true);
        }).catch (error => { 
            console.log(error)
        })
    }, [loaded]);

    useEffect(() => {
        const originalConsoleError = console.error;
        console.error = (...args) => {
          if (typeof args[0] === "string" && /defaultProps/.test(args[0])) {
            return;
          }
          originalConsoleError(...args);
        };
    
        return () => {
          console.error = originalConsoleError;
        };
    }, []);
    
    if (!loaded) return (<Loader  ml='50%' mt='10%' color="blue" />);
    const allUsers = Object.keys(distancePerUserPerDayAll);
    // console.log(userWeekNum, typeof(userWeekNum), distancePerUserPerDayByWeek[userWeekNum]);
    const distancePersUserSeries = (userTimestamp === 'All')
        ? distancePerUserPerDayAll[selectedUser]
        : (userTimestamp === 'Month') ? distancePerUserPerDayByMonth[userMonth][selectedUser] : distancePerUserPerDayByWeek[userWeekNum][selectedUser]

    // console.log(totalDistancePerUserWeek)
    const totalDistancePersUserSeries = (timestamp === 'All')
        ? totalDistancePerUserAll
        : (timestamp === 'Month') ? totalDistancePerUserMonth[month] : totalDistancePerUserWeek[weekNum]
    if (!totalDistancePersUserSeries || !distancePersUserSeries) return <></>
    return (
        <>
        <Group justify="space-between">
            <BarChart
                h={300} maw={90*totalDistancePersUserSeries.length}
                data={totalDistancePersUserSeries}
                dataKey={'username'}
                series={[{name: 'distance', color: 'indigo.5'}]}
                tickLine="none"
                gridAxis="none"
                yAxisLabel="Km"
            />
            <Flex direction={'column'}>
                <Select
                    mt={'md'}
                    mr={'50'}
                    maw={100}
                    data={['All', 'Week', 'Month']}
                    defaultValue={'All'}
                    onChange={setTimestamp}
                />
                {(timestamp === 'Week') 
                && <Select
                    mt={'md'}
                    maw={100}
                    data={allWeek}
                    defaultValue={weekNum}
                    onChange={setWeekNum}
                />}
                {(timestamp === 'Month') 
                && <Select
                    mt={'md'}
                    maw={100}
                    data={allMonth}
                    defaultValue={month}
                    onChange={setMonth}
                />}
                
            </Flex>
            
        </Group>
        <Divider mt={'xl'} mb={'xl'}></Divider>
        <Group justify="space-between">
            <BarChart
                h={300} maw={60*distancePersUserSeries.length}
                data={distancePersUserSeries}
                dataKey={'date'}
                series={[{name: 'distance', color: 'violet'}]}
                tickLine="none"
                gridAxis="none"
                yAxisLabel="Km"
            />
            <Flex direction={'column'}>
                <Select
                    // mr={'xl'}
                    maw={150}
                    data={allUsers}
                    defaultValue={username}
                    onChange={setSelectedUser}
                />

                <Select
                    mt={'md'}
                    maw={100}
                    data={['All', 'Week', 'Month']}
                    defaultValue={'All'}
                    onChange={setUserTimestamp}
                />

                {(userTimestamp === 'Week') 
                && <Select
                    mt={'md'}
                    maw={100}
                    data={allWeek}
                    defaultValue={userWeekNum}
                    onChange={setUserWeekNum}
                />}
                {(userTimestamp === 'Month') 
                && <Select
                    mt={'md'}
                    maw={100}
                    data={allMonth}
                    defaultValue={userMonth}
                    onChange={setUserMonth}
                />}
            </Flex>
        </Group>
        </>
    )
}

function ActivityDetailPage() {
    const {aid} = useParams();
    const [loaded, setLoaded] = useState(false)
    const [data, setData] = useState(null)
    const [users, setUsers] = useState([]);
    const [query, setQuery] = useState('');
    const queryParams = new URLSearchParams();
    
    useEffect(()=>{
        queryParams.append ('uq', query.toString());
        axios.get(`/activities/${aid}/detail/?${queryParams.toString()}`, {headers:headers})
        .then(response => {
            setLoaded(true)
            // console.log(response.data)
            setData(response.data.activity);
            setUsers(response.data.users);
        }).catch (error => {
            console.log(error);
        });        
    }, [query]);

    if (!loaded) return (<Loader  ml='50%' mt='10%' color="blue" />);

    // console.log(users)

    return (
        <Box h={'100%'}>
            <HeaderMegaMenu/>
            <Box ml={'200px'} mr={'200px'} >
                <CreateNewAction/>
                <AddUser aid={aid} users={users} setQuery={setQuery}/>
                <ActivityInfoTable activity={data}/>
                <UserActionInActivity aid={aid}/>
            </Box>
            
        </Box>
    )
}

export default ActivityDetailPage