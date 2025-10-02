import { useState } from 'react';
import authService from '../services/authService';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const { name, email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await authService.register(formData);
      console.log(response.data);
      alert('Registration successful!');
    } catch (error) {
      console.error(error.response.data);
      alert('Registration failed. Please check the console for details.');
    }
  };

  return (
    <div>
      <h2>Register an Account</h2>
      <form onSubmit={onSubmit}>
        <div>
          <input type="text" placeholder="Name" name="name" value={name} onChange={onChange} required />
        </div>
        <div>
          <input type="email" placeholder="Email Address" name="email" value={email} onChange={onChange} required />
        </div>
        <div>
          <input type="password" placeholder="Password" name="password" value={password} onChange={onChange} minLength="6" required />
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default RegisterPage;