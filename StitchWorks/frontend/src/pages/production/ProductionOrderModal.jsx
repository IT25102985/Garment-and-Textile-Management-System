import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Table, Row, Col, Card, Badge, Tab, Tabs } from 'react-bootstrap';
import { toast } from 'react-toastify';
import productionService from '../../services/productionService';
import productService from '../../services/productService';
import salesService from '../../services/salesService';

const ProductionOrderModal = ({ show, onClose, orderData }) => {
    const isEditMode = !!orderData;
    
    // Lookups
    const [products, setProducts] = useState([]);
    const [salesOrders, setSalesOrders] = useState([]);
    
    // Form state (Creation / Editing)
    const [isEditingDetails, setIsEditingDetails] = useState(false);
    const [orderForm, setOrderForm] = useState({
        productId: '',
        salesOrderId: '',
        quantity: '',
        startDate: new Date().toISOString().split('T')[0]
    });
    
    // Detail view state
    const [localOrder, setLocalOrder] = useState(orderData);
    const [productDetails, setProductDetails] = useState(null);
    
    // Task Form
    const [newTask, setNewTask] = useState({ processName: 'CUTTING', quantityPlanned: '', taskDate: new Date().toISOString().split('T')[0] });

    // QC Form
    const [qcForm, setQcForm] = useState({ defectType: 'STITCHING_ERROR', action: 'REWORK', quantity: '', notes: '' });
    const [selectedTaskIdForQc, setSelectedTaskIdForQc] = useState(null);

    useEffect(() => {
        if (orderData) {
            setOrderForm({
                productId: orderData.productId || '',
                salesOrderId: orderData.salesOrderId || '',
                quantity: orderData.quantity || '',
                startDate: orderData.startDate || new Date().toISOString().split('T')[0]
            });
            setLocalOrder(orderData);
        }
    }, [orderData]);

    useEffect(() => {
        const loadLookups = async () => {
            try {
                if (!isEditMode) {
                    setProducts(await productService.getAllProducts());
                    const allSos = await salesService.getAllOrders();
                    setSalesOrders(allSos.filter(so => so.status === 'PENDING' || so.status === 'IN_PRODUCTION'));
                } else {
                    const pd = await productService.getProductById(orderData.productId);
                    setProductDetails(pd);
                }
            } catch (error) {
                console.error("Failed to load lookups", error);
            }
        };
        loadLookups();
    }, [isEditMode, orderData]);

    const refreshOrder = async () => {
        try {
            const data = await productionService.getOrderById(localOrder.id);
            setLocalOrder(data);
        } catch(e) {}
    };

    const handleSaveOrder = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode && isEditingDetails) {
                await productionService.updateOrder(localOrder.id, orderForm);
                toast.success("Order updated successfully");
                setIsEditingDetails(false);
                refreshOrder();
            } else {
                await productionService.createOrder(orderForm);
                toast.success("Production Order created successfully");
                onClose(true);
            }
        } catch (error) {
            toast.error(error.response?.data || "Failed to save order");
        }
    };

    const handleDeleteOrder = async () => {
        if (!window.confirm("Are you sure you want to delete this order?")) return;
        try {
            await productionService.deleteOrder(localOrder.id);
            toast.success("Order deleted");
            onClose(true);
        } catch (e) {
            toast.error(e.response?.data || "Failed to delete order");
        }
    };

    const handleCancelOrder = async () => {
        if (!window.confirm("Are you sure you want to cancel this order? Materials will be refunded.")) return;
        try {
            await productionService.cancelOrder(localOrder.id);
            toast.success("Order cancelled");
            refreshOrder();
            onClose(true);
        } catch (e) {
            toast.error(e.response?.data || "Failed to cancel order");
        }
    };

    const handleIssueMaterials = async () => {
        try {
            await productionService.issueMaterials(localOrder.id);
            toast.success("Materials issued successfully!");
            refreshOrder();
        } catch (error) {
            toast.error(error.response?.data || "Failed to issue materials");
        }
    };

    const handleCompleteOrder = async () => {
        try {
            await productionService.completeOrder(localOrder.id);
            toast.success("Order completed. Finished goods added to inventory.");
            refreshOrder();
        } catch (error) {
            toast.error("Failed to complete order");
        }
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        try {
            await productionService.addTask(localOrder.id, newTask);
            toast.success("Task added");
            refreshOrder();
        } catch (error) {
            toast.error(error.response?.data || "Failed to add task");
        }
    };

    const handleUpdateTask = async (taskId, field, value) => {
        try {
            await productionService.updateTask(taskId, { [field]: value });
            toast.success("Task updated");
            refreshOrder();
        } catch (error) {
            toast.error(error.response?.data || "Failed to update task");
            refreshOrder(); // reset UI
        }
    };

    const handleAddQc = async (e) => {
        e.preventDefault();
        try {
            await productionService.addQcLog(selectedTaskIdForQc, qcForm);
            toast.success("QC Log added");
            setSelectedTaskIdForQc(null);
            setQcForm({ defectType: 'STITCHING_ERROR', action: 'REWORK', quantity: '', notes: '' });
            refreshOrder();
        } catch (e) {
            toast.error(e.response?.data || "Failed to add QC Log");
        }
    };

    // Helper to group tasks by process
    const getTasksByProcess = (processName) => {
        return localOrder?.tasks?.filter(t => t.processName === processName) || [];
    };

    const renderPipelineStage = (processName) => {
        const tasks = getTasksByProcess(processName);
        return (
            <Card className="mb-3">
                <Card.Header className="bg-light"><strong>{processName} STAGE</strong></Card.Header>
                <Card.Body>
                    <Table size="sm" striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Planned Qty</th>
                                <th>Completed Qty</th>
                                <th>Defects</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map(task => (
                                <tr key={task.id}>
                                    <td>{task.taskDate}</td>
                                    <td>{task.quantityPlanned}</td>
                                    <td>
                                        {localOrder.status === 'COMPLETED' || localOrder.status === 'CANCELLED' ? task.quantityCompleted : (
                                            <Form.Control size="sm" type="number" defaultValue={task.quantityCompleted} 
                                                onBlur={(e) => handleUpdateTask(task.id, 'quantityCompleted', e.target.value)} />
                                        )}
                                    </td>
                                    <td>
                                        {task.qcLogs?.reduce((acc, log) => acc + log.quantity, 0) || 0} Total
                                        {task.qcLogs?.length > 0 && (
                                            <ul className="mb-0 small text-muted">
                                                {task.qcLogs.map(qc => (
                                                    <li key={qc.id}>{qc.quantity}x {qc.defectType} ({qc.action})</li>
                                                ))}
                                            </ul>
                                        )}
                                    </td>
                                    <td>
                                        {localOrder.status === 'IN_PROGRESS' && (
                                            <Button size="sm" variant="outline-danger" onClick={() => setSelectedTaskIdForQc(task.id)}>Log QC</Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {!tasks.length && <tr><td colSpan="5" className="text-center text-muted">No tasks planned for {processName}</td></tr>}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        );
    };

    const isReadOnly = isEditMode && !isEditingDetails;

    return (
        <Modal show={show} onHide={() => onClose(false)} size="xl">
            <Modal.Header closeButton>
                <Modal.Title>{isEditMode ? `Production Order: ${localOrder.orderNumber}` : 'Create Production Order'}</Modal.Title>
                {isEditMode && localOrder.status === 'PLANNED' && !isEditingDetails && (
                    <div className="ms-auto d-flex gap-2">
                        <Button variant="outline-primary" size="sm" onClick={() => setIsEditingDetails(true)}>Edit Order</Button>
                        <Button variant="outline-danger" size="sm" onClick={handleDeleteOrder}>Delete Order</Button>
                    </div>
                )}
                {isEditMode && localOrder.status === 'IN_PROGRESS' && (
                    <div className="ms-auto">
                        <Button variant="outline-danger" size="sm" onClick={handleCancelOrder}>Cancel Order (Refund Materials)</Button>
                    </div>
                )}
            </Modal.Header>
            <Modal.Body>
                {(!isEditMode || isEditingDetails) ? (
                    // CREATION / EDITING MODE
                    <Form onSubmit={handleSaveOrder}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Finished Product</Form.Label>
                                    <Form.Select required value={orderForm.productId} onChange={e => setOrderForm({...orderForm, productId: e.target.value})} disabled={isEditingDetails}>
                                        <option value="">Select Product...</option>
                                        {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.styleCode})</option>)}
                                        {isEditingDetails && <option value={orderForm.productId}>{localOrder.productName}</option>}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Link to Sales Order (Optional)</Form.Label>
                                    <Form.Select value={orderForm.salesOrderId} onChange={e => setOrderForm({...orderForm, salesOrderId: e.target.value})}>
                                        <option value="">None</option>
                                        {salesOrders.map(so => <option key={so.id} value={so.id}>{so.orderNumber} - {so.customerName}</option>)}
                                        {isEditingDetails && orderForm.salesOrderId && !salesOrders.find(so => so.id === orderForm.salesOrderId) && (
                                            <option value={orderForm.salesOrderId}>{localOrder.salesOrderNumber}</option>
                                        )}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Quantity to Produce</Form.Label>
                                    <Form.Control type="number" required min="1" value={orderForm.quantity} onChange={e => setOrderForm({...orderForm, quantity: e.target.value})} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Start Date</Form.Label>
                                    <Form.Control type="date" required value={orderForm.startDate} onChange={e => setOrderForm({...orderForm, startDate: e.target.value})} />
                                </Form.Group>
                            </Col>
                        </Row>
                        <div className="d-flex justify-content-end mt-3 gap-2">
                            {isEditingDetails && <Button variant="secondary" onClick={() => { setIsEditingDetails(false); setOrderForm({...localOrder}); }}>Cancel</Button>}
                            <Button variant="primary" type="submit">{isEditingDetails ? 'Save Changes' : 'Create Order'}</Button>
                        </div>
                    </Form>
                ) : (
                    // DETAIL VIEW MODE
                    <div>
                        <Row className="mb-4 bg-light p-3 rounded mx-1 align-items-center">
                            <Col md={3}>
                                <strong>Status:</strong> 
                                <Badge className="ms-2" bg={
                                    localOrder.status === 'COMPLETED' ? 'success' : 
                                    localOrder.status === 'CANCELLED' ? 'danger' : 'primary'
                                }>{localOrder.status}</Badge>
                            </Col>
                            <Col md={3}><strong>Product:</strong> {localOrder.productName}</Col>
                            <Col md={3}><strong>Quantity:</strong> {localOrder.quantity}</Col>
                            <Col md={3} className="text-end">
                                {localOrder.status === 'PLANNED' && (
                                    <Button variant="warning" onClick={handleIssueMaterials}>Issue Materials</Button>
                                )}
                                {localOrder.status === 'IN_PROGRESS' && (
                                    <Button variant="success" onClick={handleCompleteOrder}>Complete Order</Button>
                                )}
                            </Col>
                        </Row>

                        <Tabs defaultActiveKey="pipeline" className="mb-3">
                            <Tab eventKey="pipeline" title="WIP Pipeline">
                                {localOrder.status === 'IN_PROGRESS' && (
                                    <Form onSubmit={handleAddTask} className="mb-4 d-flex align-items-end gap-2 border p-3 rounded bg-light">
                                        <Form.Group>
                                            <Form.Label className="small fw-bold">Plan New Task</Form.Label>
                                            <Form.Select size="sm" value={newTask.processName} onChange={e => setNewTask({...newTask, processName: e.target.value})}>
                                                <option value="CUTTING">Cutting</option>
                                                <option value="STITCHING">Stitching</option>
                                                <option value="FINISHING">Finishing</option>
                                            </Form.Select>
                                        </Form.Group>
                                        <Form.Group>
                                            <Form.Label className="small">Planned Qty</Form.Label>
                                            <Form.Control size="sm" type="number" required value={newTask.quantityPlanned} onChange={e => setNewTask({...newTask, quantityPlanned: e.target.value})} />
                                        </Form.Group>
                                        <Form.Group>
                                            <Form.Label className="small">Date</Form.Label>
                                            <Form.Control size="sm" type="date" required value={newTask.taskDate} onChange={e => setNewTask({...newTask, taskDate: e.target.value})} />
                                        </Form.Group>
                                        <Button size="sm" type="submit" variant="primary">Add Task</Button>
                                    </Form>
                                )}
                                
                                {renderPipelineStage('CUTTING')}
                                {renderPipelineStage('STITCHING')}
                                {renderPipelineStage('FINISHING')}
                            </Tab>
                            <Tab eventKey="bom" title="Bill of Materials">
                                <Table size="sm" bordered>
                                    <thead>
                                        <tr>
                                            <th>Material</th>
                                            <th>Req / Unit</th>
                                            <th>Total Req</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productDetails?.bomItems?.map(bom => (
                                            <tr key={bom.id}>
                                                <td>{bom.materialName}</td>
                                                <td>{bom.quantityRequired}</td>
                                                <td><strong>{(bom.quantityRequired * localOrder.quantity).toFixed(2)}</strong></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Tab>
                        </Tabs>
                    </div>
                )}
            </Modal.Body>

            {/* QC Log Modal overlay */}
            <Modal show={!!selectedTaskIdForQc} onHide={() => setSelectedTaskIdForQc(null)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Log Quality Control Issue</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleAddQc}>
                        <Form.Group className="mb-3">
                            <Form.Label>Defect Type</Form.Label>
                            <Form.Select value={qcForm.defectType} onChange={e => setQcForm({...qcForm, defectType: e.target.value})}>
                                <option value="STITCHING_ERROR">Stitching Error</option>
                                <option value="FABRIC_TEAR">Fabric Tear</option>
                                <option value="MEASUREMENT_ERROR">Measurement Error</option>
                                <option value="OTHER">Other</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Action Taken</Form.Label>
                            <Form.Select value={qcForm.action} onChange={e => setQcForm({...qcForm, action: e.target.value})}>
                                <option value="REWORK">Rework (Fixable)</option>
                                <option value="SCRAP">Scrap (Discard)</option>
                            </Form.Select>
                            {qcForm.action === 'SCRAP' && <Form.Text className="text-danger">Scrapping will permanently reduce WIP for downstream stages.</Form.Text>}
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Quantity</Form.Label>
                            <Form.Control type="number" min="1" required value={qcForm.quantity} onChange={e => setQcForm({...qcForm, quantity: e.target.value})} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Notes</Form.Label>
                            <Form.Control as="textarea" rows={2} value={qcForm.notes} onChange={e => setQcForm({...qcForm, notes: e.target.value})} />
                        </Form.Group>
                        <Button type="submit" variant="danger" className="w-100">Save QC Log</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Modal>
    );
};

export default ProductionOrderModal;
