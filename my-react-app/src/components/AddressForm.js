import React, { useState, useEffect, useCallback } from 'react';
import { Form, Input, AutoComplete } from 'antd';
import { Autocomplete } from '@react-google-maps/api';

const { Item } = Form;

const libraries = ['places'];

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
      if (place.address_components) {
        fillAddressFields(place);
      }
    }
  }, [autocomplete]);

  const fillAddressFields = useCallback((place) => {
    let streetNumber = '';
    let route = '';
    let newAddress = { ...address };

    // First pass: collect street number and route
    place.address_components.forEach(component => {
      const componentType = component.types[0];
      switch (componentType) {
        case 'street_number':
          streetNumber = component.long_name;
          break;
        case 'route':
          route = component.long_name;
          break;
        case 'postal_code':
          newAddress.zipCode = component.long_name;
          break;
        case 'locality':
          newAddress.city = component.long_name;
          setCityInput(component.long_name);
          break;
        case 'administrative_area_level_1':
          newAddress.state = component.long_name;
          break;
        case 'country':
          newAddress.country = component.long_name;
          break;
        case 'sublocality_level_1':
          newAddress.area = component.long_name;
          break;
      }
    });

    // Combine street number and route
    newAddress.street = [streetNumber, route]
      .filter(Boolean)
      .join(' ');

    // If there's an area, add it to the street address
    if (newAddress.area) {
      newAddress.street = `${newAddress.street}, ${newAddress.area}`;
    }

    // Update the address input with the formatted address
    setAddressInput(place.formatted_address || '');
    
    // Update the full address state
    handleAddressChange(newAddress);
  }, [address, handleAddressChange]);

  // Handle manual street address changes
  const handleStreetChange = useCallback((e) => {
    const newStreet = e.target.value;
    handleAddressChange({ ...address, street: newStreet });
  }, [address, handleAddressChange]);

  return (
    <Form layout="vertical">
      <Item label="City" required>
        <AutoComplete
          value={cityInput}
          onChange={handleCityChange}
          placeholder="Enter city"
          options={[]}
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
        <Input 
          value={address.street} 
          onChange={handleStreetChange}
          placeholder="Street address"
        />
      </Item>
      <Item label="State">
        <Input 
          value={address.state} 
          onChange={(e) => handleAddressChange({ ...address, state: e.target.value })}
          placeholder="State"
        />
      </Item>
      <Item label="Zip Code">
        <Input 
          value={address.zipCode} 
          onChange={(e) => handleAddressChange({ ...address, zipCode: e.target.value })}
          placeholder="Zip code"
        />
      </Item>
      <Item label="Country">
        <Input 
          value={address.country} 
          onChange={(e) => handleAddressChange({ ...address, country: e.target.value })}
          placeholder="Country"
        />
      </Item>
    </Form>
  );
};

export default AddressForm;
