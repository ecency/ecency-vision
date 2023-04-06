import React from 'react'
import { Button, Form } from "react-bootstrap";

export const CreateFriendAccount = (props: any) => {
    const { activeUser } = props
  return (
    <div>
         <div>
                <div className="page-header mt-2 mb-2">                  
                  <h4>You can now create account for a friend</h4>
                </div>

              <div style={{width: "100%"}} >
                <Form>
                  <Form.Group className="form-group">
                  <Form.Label className="form-label">Creator</Form.Label>
                    <Form.Control
                      type="text"
                      autoComplete="off"
                      value={`@${activeUser.username}`}
                      required={true}
                      readOnly
                    />
          
                  </Form.Group>
                  <Form.Group className="form-group">
                  <Form.Label className="form-label">Desired username</Form.Label>
                    <Form.Control
                      type="text"
                      autoComplete="off"
                      placeholder="choose a username"
                      required={true}
                    />
                  </Form.Group>
                  <Form.Group className="form-group">
                  <Form.Label className="form-label">Transacion fee</Form.Label>
                    <Form.Control
                      type="text"
                      autoComplete="off"
                      value="3hive"
                      required={true}
                      readOnly
                    />
                  </Form.Group>
                  <Form.Group className="form-group">
                  <Form.Label className="form-label">Posting key</Form.Label>
                    <Form.Control
                      type="password"
                      autoComplete="off"
                      placeholder="Private Key"
                      required={true}
                    />
                  </Form.Group>
                  <div className="d-flex justify-content-center">
                    <Button
                      type="submit"
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                    >
                      Create account
                    </Button>
                  </div>
                </Form>
              </div>             
              </div>
    </div>
  )
}
