import React, { useState, useEffect } from 'react';
import { Select, message } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

const EnquirySelector = ({ onEnquirySelect }) => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.error('Authentication token not found');
      navigate('/login');
      return null;
    }
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await axios.get('http://localhost:5001/api/enquiries/get', {
        headers
      });
      
      if (response.data.success) {
        const enquiriesData = response.data.data || [];
        setEnquiries(enquiriesData);
      } else {
        message.error(response.data.message || 'Failed to fetch enquiries');
        setEnquiries([]);
      }
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      if (error.response?.status === 401) {
        message.error('Session expired. Please login again');
        navigate('/login');
      } else {
        message.error(error.response?.data?.message || 'Failed to fetch enquiries');
      }
      setEnquiries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEnquiryChange = async (enquiryId) => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await axios.get(`http://localhost:5001/api/enquiries/${enquiryId}`, {
        headers
      });
      
      if (response.data.success) {
        const enquiryData = response.data.data;
        if (enquiryData) {
          onEnquirySelect(enquiryData);
        } else {
          message.error('Enquiry data not found');
        }
      } else {
        message.error(response.data.message || 'Failed to fetch enquiry details');
      }
    } catch (error) {
      console.error('Error fetching enquiry details:', error);
      if (error.response?.status === 401) {
        message.error('Session expired. Please login again');
        navigate('/login');
      } else {
        message.error(error.response?.data?.message || 'Failed to fetch enquiry details');
      }
    }
  };

  const formatEnquiryOption = (enquiry) => {
    const customerName = enquiry.customer?.username || 'Unknown';
    const date = new Date(enquiry.createdAt).toLocaleDateString();
    const productCount = enquiry.products?.length || 0;
    const productDetails = enquiry.products?.map(p => p.product?.name).filter(Boolean).join(', ') || 'No products';
    
    return `${customerName} - ${date} - ${productCount} products (${productDetails})`;
  };
  return (
    <Select
      loading={loading}
      placeholder="Select an enquiry"
      style={{ width: '100%' }}
      onChange={(value) => handleEnquiryChange(value)}
      showSearch
      filterOption={(input, option) =>
        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
      optionFilterProp="children"
    >
      {Array.isArray(enquiries) && enquiries.map(enquiry => (
        <Option 
          key={enquiry._id} 
          value={enquiry._id}
          title={formatEnquiryOption(enquiry)}
        >
          {formatEnquiryOption(enquiry)}
        </Option>
      ))}
    </Select>
  );
};

export default EnquirySelector;
