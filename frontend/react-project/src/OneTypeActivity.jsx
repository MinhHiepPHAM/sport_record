import { useEffect, useState } from 'react';
import {
    Text,
    Box,
    Loader,
} from '@mantine/core';
import { HeaderMegaMenu } from './HeaderMegaMenu';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { TableSort } from './AllActivity';


function OneTypeActivityPage({type}) {
    const {uid} = useParams();
    const [loaded, setLoaded] = useState(false);
    const [data, setData] = useState([])

    useEffect(()=>{
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Token ' + token
            };

            axios.get(`users/${uid}/activities/${type}`, {headers:headers})
            .then(response => {
                setData(response.data.activities)
                setLoaded(true)
            }).catch (error => {
                console.log(error);
            });
        } catch (e) {
            console.error('Activity page failed:');
        };

    }, []);

    if (!loaded) return <Loader  ml='50%' mt='10%' color="blue" />;
    
    return (
        <Box h={'100%'}>
            <HeaderMegaMenu/>
            <Box ml={'200px'} mr={'200px'} >
                {(data.length > 0)  &&
                <Text ta='center' size='xl' fw={500} mt='xl' mb='-xl' c={'var(--mantine-color-blue-5)'}>
                    Your {type} activities
                </Text>}
                { (data.length > 0) 
                ? <TableSort data={data} uid={uid} all={true} summary={true} run={false} swim={true} bike={true}/>
                : <div style={{display: 'flex', justifyContent: 'center', marginTop:'100px'}}><Text size='xl' c={'var(--mantine-color-blue-6)'}>There is no activity yet</Text></div>
                }
            </Box>
            
        </Box>
    )
};

export default OneTypeActivityPage;