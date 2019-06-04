import React, { Component } from 'react';
import { Grid, Row, Col, Tab, Tabs, Modal } from 'react-bootstrap';

import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../css/inventoryManagement.css';

class InventoryManagement extends Component {
    constructor(props, context) {
        super(props, context);

        this.URL = "https://mafi-backend.herokuapp.com";

        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);

        this.state = {
            submitted: false,
            show: false,
            items: [],
            item: {
                id: '',
                description: '',
                times_bought: 0,
                times_sold: 0,
                type: '',
                color: '',
                sell_price: 0
            }
        };
    }

    handleSubmit = (event) => {
        event.preventDefault();

        var description = event.target[0].value;
        var type = event.target[1].value;
        var color = event.target[2].value;
        var purchase_price = event.target[3].value;
        var sell_price = event.target[4].value;

        if ( description == '' || type == '' || color == '' || purchase_price == '' || sell_price == '') {
            this.state.submitted = false;
            this.handleShow();
        }else{
            fetch(this.URL+`/items/add?description=${description}&type=${type}&color=${color}&purchase_price=${purchase_price}&sell_price=${sell_price}`)
                .then(this.getOrders)
                .catch(err => console.error(err))

            this.state.submitted = true;
            this.handleShow();
        }
    }

    handleClose() {
        this.setState({ show: false });
    }

    handleShow() {
        this.setState({ show: true });
    }

    componentDidMount(){
        this.getItems();
    }

    getItems = _ => {
        fetch(this.URL+`/items`)
        .then(response => response.json())
        .then(resp => this.setState({ items: resp.data }))
        .catch(err => console.error(err))
    }

    numberWithDots = (x) => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    renderItem = ({id, description, times_bought, times_sold, type, color, sell_price} ) => <tr key={id}><td>{id}</td><td>{description}</td><td>{times_bought}</td><td>{times_sold}</td><td>{times_bought-times_sold}</td><td><img src={ this.URL+"/img?image=" + type } alt={type}/></td><td>{color}</td><td>{"$"+this.numberWithDots(sell_price)}</td></tr>

    render() {
        const { items, item } = this.state;

        return (
            !(items.length) ? (
                <span>Loading...</span>
            ) : (
                <div>
                    <div className="page-title">
                        <h1>Gestión de inventario</h1>
                        <hr />
                    </div>

                    <Tabs defaultActiveKey={1} id="uncontrolled-tab" animation={false}>
                        <Tab eventKey={1} title="Ver productos">
                            <div className="tab-container">
                                <div className="long-block">
                                    <div className="block-title">Catálogo</div>

                                    <div className="block-body">
                                        <table className="table table-sm table-hover">
                                            <thead>
                                                <tr>
                                                    <th scope="col">ID</th>
                                                    <th scope="col">Descripción</th>
                                                    <th scope="col">Veces comprado</th>
                                                    <th scope="col">Veces vendido</th>
                                                    <th scope="col">Stock</th>
                                                    <th scope="col">Tipo</th>
                                                    <th scope="col">Color</th>
                                                    <th scope="col">Precio</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                { items.map(this.renderItem) }
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </Tab>

                        <Tab eventKey={2} title="Agregar productos">
                            <div className="tab-container">
                                <form onSubmit={this.handleSubmit}>
                                    <div className="form-group">
                                        <label htmlFor="description">Descripción del producto</label>
                                        <input placeholder="Mochila Kanken roja" id="description" name="description" type="text" className="form-control" />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group col-md-6">
                                            <label htmlFor="number">Estilo del producto</label>
                                            <input placeholder="KANKEN" id="type" name="type" type="text" className="form-control" />
                                        </div>

                                        <div className="form-group col-md-6">
                                            <label htmlFor="color">Color del producto (Usar color neutro: ROJO, ROSADO, AMARILLO)</label>
                                            <input placeholder="ROSADO" id="color" name="color" type="text" className="form-control" />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group col-md-6">
                                            <label htmlFor="purchase_price">Indica el precio de compra</label>
                                            <input placeholder="5500" id="purchase_price" name="purchase_price" className="form-control" />
                                        </div>

                                        <div className="form-group col-md-6">
                                            <label htmlFor="sell_price">Indica el precio de venta</label>
                                            <input placeholder="11000" id="sell_price" name="sell_price" className="form-control" />
                                        </div>
                                    </div>

                                    <button type="submit" className="btn btn-primary">Enviar datos</button>
                                </form>
                            </div>
                        </Tab>
                    </Tabs>

                    <Modal show={this.state.show} onHide={this.handleClose} animation={true}>
                        <Modal.Header>
                            <Modal.Title>Acerca del producto</Modal.Title>
                        </Modal.Header>

                        <Modal.Body>
                                {
                                    (!this.state.submitted)?
                                    <p>Faltan datos por ingresar.</p>
                                    :
                                    <p>¡Enviado!</p>
                                }
                        </Modal.Body>

                        <Modal.Footer>
                            <button className="btn btn-primary" onClick={this.handleClose}>Cerrar</button>
                        </Modal.Footer>
                    </Modal>

                    <br />
                </div>
            )
        );
    }
}

export default InventoryManagement;
