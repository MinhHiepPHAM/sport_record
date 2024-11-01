import {
	TextInput,
	PasswordInput,
	Checkbox,
	Anchor,
	Paper,
	Title,
	Text,
	Container,
	Group,
	Button,
	Box,
} from '@mantine/core';
import classes from './css/authentication.module.css';
import React, { useState } from 'react';
import axios from 'axios';	
import { useNavigate } from 'react-router-dom';
import { useViewportSize } from '@mantine/hooks';
import { HeaderMegaMenu } from './HeaderMegaMenu';


function RegisterForm() {
	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [password1, setPassword1] = useState('');
	const [password2, setPassword2] = useState('');
	const [error, setError] = useState('');

	const navigate = useNavigate();

	const handleSubmit = async (e) => {	
		e.preventDefault();
		try {
			const response = await axios.post('/signup/', {
				username,
				email,
				password1,
				password2
			},{
				headers: {'Content-Type': 'application/json'}
			});
			// console.log(response.data);
			navigate('/login');
		} catch (e) {
			console.error('Login failed:', e);
			setError(e.response.data.error)
			// console.log(error)
		}
	};
	return (
		<Container size={420} my={40}>
			<Title ta="center" className={classes.title}>
				Welcome to Samurai X!
			</Title>
			<Text c="dimmed" size="sm" ta="center" mt={5}>
				You have already an account?{' '}
				<Anchor size="sm" component="button" onClick={(e)=>{navigate('/login')}}>
					Log In
				</Anchor>
			</Text>

			<Paper withBorder shadow="md" p={30} mt={30} radius="md">
				{	error === undefined || error === '' ||
					<Text c='red' size='md' ta="left" mb='md'>
						{error}
					</Text>
				}
				
				<TextInput
					label="Username" placeholder="Your username" required mb="md"
					onChange={(e) => setUsername(e.target.value)}
				/>
				<TextInput
					label="Email" placeholder="Your Email" required
					onChange={(e) => setEmail(e.target.value)}
				/>
				<PasswordInput
					label="Password" placeholder="Your password" required mt="md" 
					onChange={(e) => setPassword1(e.target.value)}
				/>
				<PasswordInput
					label="Confirm password" placeholder="Confirm your password" required mt="md" 
					onChange={(e) => setPassword2(e.target.value)}
				/>
				<Group justify="space-between" mt="lg">
					<Checkbox label="I accept terms and conditions" />
				</Group>
				<Button fullWidth mt="xl" type='submit' onClick={handleSubmit}>
					Register
				</Button>
			</Paper>
		</Container>
	);
}

function Register() {
	const { height, width } = useViewportSize();
	return (
			<Box w={width} h={height}>
					<HeaderMegaMenu/>
					<RegisterForm />
			</Box>
	);
}
export default Register