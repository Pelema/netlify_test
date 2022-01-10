import React, { useState, useEffect } from 'react';
import { Button, Row, Col, Input, Label, FormGroup } from 'reactstrap';
import { placeBid } from '../web3Client'
import Modal from 'react-modal';
import { useForm } from 'react-hook-form'

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
    },
};

function CustomModal(props) {
    const { modalIsOpen, setIsOpen, itemId } = props
    const { register, handleSubmit, formState: { errors } } = useForm();

    let subtitle;


    const onSubmit = (formData) => {
        placeBid(formData.itemId, formData.amount)
            .then(res => {
                console.log(res)
                window.location.reload(false);
            })
            .catch(err => {
                console.log(err)
            })
    }

    function afterOpenModal() {
        // references are now sync'd and can be accessed.
        subtitle.style.color = '#f00';
    }

    function closeModal() {
        setIsOpen(false);
    }

    useEffect(() => { }, [])
    return (
        <div>
            <Modal
                isOpen={modalIsOpen}
                onAfterOpen={afterOpenModal}
                onRequestClose={closeModal}
                style={customStyles}
                contentLabel="Example Modal"
            >
                <h2 ref={(_subtitle) => (subtitle = _subtitle)}>Hello</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Row>
                        <FormGroup>
                            <Col>
                                <Label>Currency</Label>
                                <select className='form-control' {...register("currency")}>
                                    <option>USD</option>
                                    <option>ETH</option>
                                </select>
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col>
                                <Label>Amount</Label>
                                <input className='form-control' {...register("amount")} />
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col>
                                <input hidden defaultValue={itemId} className='form-control' {...register("itemId")} />
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col>
                                <input type='submit' value="Place Bid" className='form-control' />
                            </Col>
                        </FormGroup>
                    </Row>

                </form>
            </Modal>
        </div>
    );
}

export default CustomModal;
