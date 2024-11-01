import { Avatar, Box, Flex, Grid, Loader, Text, Pagination, TextInput } from "@mantine/core";
import axios from "axios";
import { useEffect, useState } from "react";
import { HeaderMegaMenu } from "./HeaderMegaMenu";
import avaLogo from './assets/default.png'

const token = localStorage.getItem('token');
const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Token ' + token
};

function filterUser(users, search) {
    const query = search.toLowerCase().trim();
    return data.filter((item) => {
        return item.username.toLowerCase().includes(query)
    });
}

function sortData(data, sortBy, search) {

    if (!sortBy) {
        return filterUser(data, search);
    }

    return filterUser(
    [...data].sort((a, b) => {
        if (payload.reversed) {
            return b[sortBy].localeCompare(a[sortBy]);
        }

        return a[sortBy].localeCompare(b[sortBy]);
    }), search
    );
}

function AllUsersPage() {
    const [loaded, setLoaded] = useState(false);
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [count, setCount] = useState(0);
    const [total, setTotal] = useState(0);
    useEffect(()=>{
        try {

            const queryParams = new URLSearchParams();
            if (currentPage !== 1) queryParams.append('p', currentPage.toString())
            queryParams.append ('search', searchQuery.toString());

            axios.get(`/users/?${queryParams.toString()}`, {headers:headers})
            .then(response => {
                setLoaded(true)
                setUsers(response.data['users']);
                setCount(response.data['count']);
                setTotal(response.data['num_page']);
            }).catch (error => {
                console.log(error);
            });
        } catch (e) {
            console.error(e);
        };

    }, [searchQuery, total, currentPage]);

    if (!loaded) return <Loader  ml='50%' mt='10%' color="blue" />;

    const usersView = (
        <Grid mt='xl'>
            {users.map((user,i) => (
                <Grid.Col key={i} span={{ base: 12, md: 6, lg: 3 }}>
                    <Flex direction={'row'} mt='md' gap='md' align='center'>
                        <a href={`/users/${user.id}`}>
                            <Avatar
                                size={50}
                                src={(user.avatar!=='') ? user.avatar : avaLogo}
                            />
                        </a>
                        <Text>{user.username}</Text>
                    </Flex>
                </Grid.Col>
            ))}
        </Grid>
    );

    return (
        <Box h={'100%'}>
            <HeaderMegaMenu/>
            <Box ml={'200px'} mr={'200px'} >
                <div style={{display:'flex', justifyContent:'center'}}>
                    <TextInput
                        w={'300px'} mt={'xl'}
                        placeholder="Username"
                        onChange={(e)=>{
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
                {usersView}
                <div style={{display:'flex', justifyContent:'center'}}>
                    <Pagination
                        mt={'xl'}
                        total={total}
                        boundaries={1}
                        onChange={setCurrentPage}
                    />
                </div>
            </Box>
            
        </Box>
    )
}

export default AllUsersPage;