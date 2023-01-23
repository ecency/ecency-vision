import React, { useEffect, useState } from 'react'
import { Button, Modal } from "react-bootstrap";
import { _t } from "../../i18n";
import { findRcAccounts } from "../../api/hive";
import { ResourceCreditsDelegation } from "../rc-delegation"
import { RcDelegationsList } from '../rc-delegations-list';
import { rcFormatter } from '../../util/formatted-number';
import { ConfirmDelete } from '../rc-delegations-list';

export const ResourceCreditsInfo = (props: any) => {

    const [showRcInfo, setShowRcInfo] = useState(false);
    const [delegated, setDelegated] = useState();
    const [receivedDelegation, setReceivedDelegation] = useState();
    const [resourceCredit, setresourceCredit] = useState<any>();
    const [showDelegationModal, setShowDelegationModal] = useState(false)
    const [showDelegationsList, setShowDelegationsList] = useState(false)
    const [listMode, setListMode] = useState("")
    const [toFromList, setToFromList] = useState('')
    const [amountFromList, setAmountFromList]: any = useState('')
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [delegateeData, setDelegateeData] = useState("")

    const { rcPercent, account, activeUser } = props;

    useEffect(() => {
        findRcAccounts(account.name).then((r) => {
            const outGoing = r.map((a: any) => a.delegated_rc);
            const delegated = outGoing[0]
            const formatOutGoing: any =  rcFormatter(delegated)
            setDelegated(formatOutGoing);
            const availableResourceCredit: any = r.map((a: any) => a.rc_manabar.current_mana);
            setresourceCredit(availableResourceCredit);
            const inComing: any = r.map((a: any) => Number(a.received_delegated_rc));
            const formatIncoming = rcFormatter(inComing);
            setReceivedDelegation(formatIncoming);
          })
    }, []);

    const showModal = () => {
        setShowRcInfo(true);
    };

    const hideModal = () => {
        setShowRcInfo(false);
    };

    const showDelegation = () => {
      setShowDelegationModal(true);
      setShowRcInfo(false);
    };
    
    const hideDelegation = () => {
      setShowDelegationModal(false);
      setToFromList('');
      setAmountFromList('');
    };

    const showIncomingList = () => {
      setShowDelegationsList(true)
      setListMode("in")
    }

    const showOutGoingList = () => {
      setShowDelegationsList(true)
      setListMode("out")
  };

    const hideList = () => {
      setShowDelegationsList(false)
  };

  const confirmDelete = () => {
    setShowConfirmDelete(true)
    setShowDelegationsList(false);
  }

  const hideConfirmDelete = () => {
    setShowConfirmDelete(false)
  }
  return (
      <div>

        <div className="cursor-pointer d-flex flex-column mb-1"  onClick={showModal}>          
        <div className="progress">
          <div
          className="progress-bar progress-bar-success"
          role="progressbar"
          style={{ width: `${rcPercent}%`,    }}
          >
          {_t("rc-info.available")}
          </div>
          <div
          className="progress-bar progress-bar-danger"
          role="progressbar"
          style={{ width: `${100 - rcPercent}%`,   }}
          >
          {_t("rc-info.used")}
          </div>
        </div>
        <div className="rc-percentage mt-2 align-self-center">
          <span className="cursor-pointer">
            {_t("rc-info.resource-credits")}
          </span>
        </div>
        </div>

    <Modal size='lg' width={'90%'}
      animation={false}
      show={showRcInfo}
      centered={true}
      onHide={hideModal}
      keyboard={false}
      className="purchase-qr-dialog"
      dialogClassName="modal-90w"
      >
      <Modal.Header closeButton={true}>
        <Modal.Title>
          <div className="rc-header">            
          <span>
            {_t("rc-info.resource-credits")}
          </span>
          <div className="about-rc">  
            <span>{_t("rc-info.check-faq")}</span>          
            <a href={_t("rc-info.learn-more")}>
            {_t("rc-info.faq-link")}
            </a>
          </div>
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="container">
          <div className="rc-info">
            <p className="h4">{_t("rc-info.resource-credit")}</p>
            <p>{rcFormatter(resourceCredit)}</p>          
          </div>

          <div className="rc-info">
            <p className="h4">{_t("rc-info.rc-available")}</p>
            <p>{`${rcPercent}%`}</p>          
          </div>

          <div className="rc-info">
            <p className="h4">{_t("rc-info.rc-used")}</p>
            <p>{`${(100 - rcPercent).toFixed(2)}%`}</p>          
          </div>

          <div onClick={showOutGoingList} className="cursor-pointer rc-info">
            <p className="h4">{_t("rc-info.delegated")}</p>
            <p>{delegated}</p>          
          </div>

          <div onClick={showIncomingList} className="cursor-pointer rc-info">
            <p className="h4">{_t("rc-info.received-delegations")}</p>
            <p>{receivedDelegation}</p>            
          </div>
        </div>
       
        <div className="d-flex justify-content-center mt-3">
            <Button onClick={showDelegation}>
             {_t("rc-info.delegation-button")}
            </Button> 
        </div>
      </Modal.Body>
    </Modal>

    <Modal 
    onHide={hideList} 
    show={showDelegationsList} 
    centered={true} 
    animation={false} 
    size="lg">
    <Modal.Header closeButton={true}>
      <Modal.Title>
        {listMode === "in" ? _t("rc-info.incoming") :_t("rc-info.outgoing")}
      </Modal.Title>
    </Modal.Header>
    <Modal.Body>
    <RcDelegationsList 
    activeUser={activeUser} 
    rcFormatter={rcFormatter} 
    delegated={delegated} 
    showDelegation={showDelegation} 
    hideList={hideList}
    listMode={listMode}
    setToFromList={setToFromList}
    setAmountFromList={setAmountFromList}
    confirmDelete={confirmDelete}
    setDelegateeData={setDelegateeData}
    setShowDelegationsList={setShowDelegationsList}
    />    
    </Modal.Body>
  </Modal>    
          
    <div>
    <Modal
      animation={false}
      show={showDelegationModal}
      centered={true}
      onHide={hideDelegation}
      keyboard={false}
      className="transfer-dialog modal-thin-header"
      size="lg"
    >
      <Modal.Header closeButton={true}>
        <Modal.Title>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
      <ResourceCreditsDelegation 
      {...props} 
      activeUser={activeUser} 
      resourceCredit={resourceCredit} 
      hideDelegation={hideDelegation}
      toFromList={toFromList}
      amountFromList={amountFromList}
      delegateeData={delegateeData}
      />
      </Modal.Body>
    </Modal>

    <Modal
      animation={false}
      show={showConfirmDelete}
      centered={true}
      onHide={hideConfirmDelete}
      keyboard={false}
      className="transfer-dialog modal-thin-header"
      // size="lg"
    >
      <Modal.Header closeButton={true}>
        <Modal.Title>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
      <ConfirmDelete
      activeUser={activeUser}
      to={toFromList}
      hideConfirmDelete={hideConfirmDelete}
      />
      </Modal.Body>
    </Modal>

    </div>     
    </div>
  );
};
