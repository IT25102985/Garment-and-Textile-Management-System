import React, { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiMapPin } from 'react-icons/fi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import inventoryService from '../../services/inventoryService';
import { toast } from 'react-toastify';
import { Modal, Button, Form, Badge, Table, Row, Col } from 'react-bootstrap';

const LocationsTab = () => {
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [editingLocation, setEditingLocation] = useState(null);
    
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        status: 'ACTIVE'
    });

    const { data: locations = [], isLoading } = useQuery({
        queryKey: ['storageLocations'],
        queryFn: inventoryService.getAllLocations
    });

    const createMutation = useMutation({
        mutationFn: inventoryService.createLocation,
        onSuccess: () => {
            queryClient.invalidateQueries(['storageLocations']);
            toast.success('Location created successfully');
            handleClose();
        },
        onError: (err) => toast.error(err.response?.data || 'Failed to create location')
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => inventoryService.updateLocation(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['storageLocations']);
            toast.success('Location updated successfully');
            handleClose();
        },
        onError: (err) => toast.error(err.response?.data || 'Failed to update location')
    });

    const deleteMutation = useMutation({
        mutationFn: inventoryService.deleteLocation,
        onSuccess: () => {
            queryClient.invalidateQueries(['storageLocations']);
            toast.success('Location deleted successfully');
        },
        onError: (err) => toast.error('Failed to delete location')
    });

    const handleOpen = (location = null) => {
        if (location) {
            setEditingLocation(location);
            setFormData({
                code: location.code,
                name: location.name,
                description: location.description || '',
                status: location.status
            });
        } else {
            setEditingLocation(null);
            setFormData({ code: '', name: '', description: '', status: 'ACTIVE' });
        }
        setShowModal(true);
    };

    const handleClose = () => {
        setShowModal(false);
        setEditingLocation(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingLocation) {
            updateMutation.mutate({ id: editingLocation.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this storage location?')) {
            deleteMutation.mutate(id);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-slate-500">Loading locations...</div>;
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <FiMapPin className="text-indigo-500" />
                        Storage Locations
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">Manage warehouses, aisles, and bins</p>
                </div>
                <Button 
                    variant="primary" 
                    className="d-flex align-items-center gap-2 bg-indigo-600 border-0 hover:bg-indigo-700"
                    onClick={() => handleOpen()}
                >
                    <FiPlus /> Add Location
                </Button>
            </div>

            <div className="p-0">
                <Table responsive hover className="mb-0 border-slate-200 align-middle">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 px-4 border-b">Code</th>
                            <th className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 px-4 border-b">Name</th>
                            <th className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 px-4 border-b">Description</th>
                            <th className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 px-4 border-b">Status</th>
                            <th className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 px-4 border-b text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {locations.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center py-8 text-slate-500">
                                    No locations found. Add your first storage location!
                                </td>
                            </tr>
                        ) : (
                            locations.map(loc => (
                                <tr key={loc.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="py-3 px-4">
                                        <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded text-slate-700">
                                            {loc.code}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 font-medium text-slate-900">{loc.name}</td>
                                    <td className="py-3 px-4 text-slate-500 text-sm max-w-xs truncate">{loc.description || '-'}</td>
                                    <td className="py-3 px-4">
                                        <Badge bg={loc.status === 'ACTIVE' ? 'success' : 'secondary'} className="rounded-pill px-3 py-1 bg-opacity-10">
                                            {loc.status}
                                        </Badge>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => handleOpen(loc)}
                                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors cursor-pointer border-none bg-transparent"
                                                title="Edit Location"
                                            >
                                                <FiEdit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(loc.id)}
                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer border-none bg-transparent"
                                                title="Delete Location"
                                            >
                                                <FiTrash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </div>

            {/* Add/Edit Modal */}
            <Modal show={showModal} onHide={handleClose} centered backdrop="static">
                <Form onSubmit={handleSubmit}>
                    <Modal.Header closeButton className="border-b border-slate-100 bg-slate-50/50">
                        <Modal.Title className="text-lg font-bold text-slate-800">
                            {editingLocation ? 'Edit Storage Location' : 'Add Storage Location'}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="p-4 space-y-4">
                        <Row>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-sm font-medium text-slate-700">Location Code *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="e.g. WH-A-S1"
                                        value={formData.code}
                                        onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                                        required
                                        className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 font-mono"
                                    />
                                    <Form.Text className="text-muted text-xs">A unique short identifier for this location.</Form.Text>
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-sm font-medium text-slate-700">Location Name *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="e.g. Warehouse A - Shelf 1"
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                        required
                                        className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-sm font-medium text-slate-700">Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        placeholder="Optional details about this location..."
                                        value={formData.description}
                                        onChange={e => setFormData({...formData, description: e.target.value})}
                                        className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group className="mb-2">
                                    <Form.Label className="text-sm font-medium text-slate-700">Status</Form.Label>
                                    <Form.Select
                                        value={formData.status}
                                        onChange={e => setFormData({...formData, status: e.target.value})}
                                        className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="ACTIVE">Active</option>
                                        <option value="INACTIVE">Inactive</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer className="border-t border-slate-100 bg-slate-50/50">
                        <Button variant="light" onClick={handleClose} className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50">
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            variant="primary" 
                            disabled={createMutation.isPending || updateMutation.isPending}
                            className="bg-indigo-600 border-0 hover:bg-indigo-700"
                        >
                            {(createMutation.isPending || updateMutation.isPending) ? 'Saving...' : 'Save Location'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default LocationsTab;
