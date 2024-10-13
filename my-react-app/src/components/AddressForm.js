import React, { useState, useEffect, useCallback } from 'react';
import { Form, Input, AutoComplete } from 'antd';
import { Autocomplete } from '@react-google-maps/api';

const { Item } = Form;

// Define libraries array outside of the component
const libraries = ['places'];

// You should store your API key in an environment variable

const AddressForm = ({ onAddressChange, initialAddress = {} }) => {
    
  const [cityInput, setCityInput] = useState(initialAddress.city || '');
  const [addressInput, setAddressInput] = useState('');
  const [autocomplete, setAutocomplete] = useState(null);
  const [address, setAddress] = useState(initialAddress);

  const handleAddressChange = useCallback((newAddress) => {
    setAddress(newAddress);
    if (onAddressChange) {
      onAddressChange(newAddress);
    }
  }, [onAddressChange]);

  const handleCityChange = useCallback((value) => {
    setCityInput(value);
    handleAddressChange({ ...address, city: value });
  }, [address, handleAddressChange]);

  const handlePlaceSelect = useCallback(() => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      fillAddressFields(place);
    }
  }, [autocomplete]);

  const fillAddressFields = useCallback((place) => {
    let newAddress = { ...address };
    for (const component of place.address_components) {
      const componentType = component.types[0];
      switch (componentType) {
        case 'street_number':
          newAddress.street = `${component.long_name} ${newAddress.street || ''}`.trim();
          break;
        case 'route':
          newAddress.street = `${newAddress.street || ''} ${component.short_name}`.trim();
          break;
        case 'postal_code':
          newAddress.zipCode = component.long_name;
          break;
        case 'locality':
          newAddress.city = component.long_name;
          break;
        case 'administrative_area_level_1':
          newAddress.state = component.short_name;
          break;
        case 'country':
          newAddress.country = component.long_name;
          break;
      }
    }
    setAddressInput(place.formatted_address);
    handleAddressChange(newAddress);
  }, [address, handleAddressChange]);

  return (
      <Form layout="vertical">
        <Item label="City" required>
          <AutoComplete
            value={cityInput}
            onChange={handleCityChange}
            placeholder="Enter city"
            options={[]} // You can add city suggestions here if needed
          />
        </Item>
        <Item label="Address" required>
          <Autocomplete
            onLoad={setAutocomplete}
            onPlaceChanged={handlePlaceSelect}
            restrictions={{ country: 'in' }}
            fields={['address_components', 'formatted_address', 'geometry']}
          >
            <Input
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              placeholder="Enter full address"
            />
          </Autocomplete>
        </Item>
        <Item label="Street">
          <Input value={address.street} readOnly />
        </Item>
        <Item label="State">
          <Input value={address.state} readOnly />
        </Item>
        <Item label="Zip Code">
          <Input value={address.zipCode} readOnly />
        </Item>
        <Item label="Country">
          <Input value={address.country} readOnly />
        </Item>
      </Form>
  );
};

export default AddressForm;
