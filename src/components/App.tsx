import { AnchorButton, Button, ButtonGroup, Classes, Collapse, ControlGroup, Dialog, FormGroup, H2, InputGroup, Intent, NonIdealState } from '@blueprintjs/core';
import React, { useState } from 'react';
import 'firebase/firestore';
import { useFirestoreDocData, useFirestore } from 'reactfire';
import "./App.css";

const App = () => {
  const [linkToAdd, setLinkToAdd] = useState<string>("");
  const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false);
  const [openLink, setOpenLink] = useState<string>("");
  const [links, setLinks] = useState<string[]>([]);
  const [processedLinks, setProcessedLinks] = useState<string[]>([]);
  const [collapseIsOpen, setCollapseIsOpen] = useState(false);

  // easily access the Firestore library
  const docRef = useFirestore()
    .collection('links')
    .doc('uVg82XGeIY5qSFmFrrvb');

  // subscribe to a document for realtime updates. just one line!
  const { status, data } = useFirestoreDocData(docRef);
  console.log(status, data);

  const addLinkToQueue = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLinks([...links, linkToAdd]);
    setLinkToAdd("");
  };

  const handleOpenLink = (link: string) => {
    setOpenLink(link);
    setDialogIsOpen(true);
  }

  const keepLinkInQueue = () => {
    setDialogIsOpen(false);
    setOpenLink("");
  };

  const removeLinkFromQueue = () => {
    processLink(openLink);
    setDialogIsOpen(false);
    setOpenLink("");
  }

  const processLink = (link: string) => {
    for (let i = 0; i < links.length; i++) {
      if (links[i] === link) {
        setLinks([...links.slice(0, i), ...links.slice(i + 1)]);
        setProcessedLinks([...processedLinks, link]);
        return;
      }
    }

    console.error("Couldn't find link to process");
  };

  return <div id="app-container" className={Classes.DARK}>
    <H2>Workload</H2>

    <div style={{ marginTop: "5px" }}>
      <form onSubmit={addLinkToQueue}>
        <FormGroup>
          <ControlGroup>
            <InputGroup fill autoFocus type="text" placeholder="Link" value={linkToAdd} onChange={(e) => setLinkToAdd(e.target.value)} />
            <Button type="submit" intent={Intent.PRIMARY}>Add to Queue</Button>
          </ControlGroup>
        </FormGroup>
      </form>
    </div>

    <div style={{ marginBottom: "20px" }}>
      {links.length === 0 ? <NonIdealState icon="inbox" title="Empty Queue" description="Add links you want to visit later" /> : <ButtonGroup minimal fill vertical alignText="left">
        {links.map((link, idx) => <AnchorButton key={idx} href={link} icon="share" target="_blank" rel="noreferrer noopener" onClick={() => handleOpenLink(link)}>{link}</AnchorButton>)}
      </ButtonGroup>}
    </div>

    {processedLinks.length > 0 && <div className={Classes.TEXT_MUTED}>
      <Button minimal fill alignText="left" icon={collapseIsOpen ? "chevron-down" : "chevron-right"} onClick={() => setCollapseIsOpen(!collapseIsOpen)}>Processed</Button>
      <Collapse isOpen={collapseIsOpen}>
        <ul className={Classes.LIST}>
          {processedLinks.map((link, idx) => <li key={idx}>{link}</li>)}
        </ul>
      </Collapse>
    </div>}

    <Dialog title="Process Link" isOpen={dialogIsOpen} usePortal={false} isCloseButtonShown={false}>
      <div className={Classes.DIALOG_BODY}>
        <p>
          Are you done with <a href={openLink} target="_blank" rel="noreferrer noopener">{openLink}</a>?
        </p>
      </div>

      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button onClick={keepLinkInQueue}>No, keep in queue</Button>
          <Button onClick={removeLinkFromQueue} intent={Intent.PRIMARY}>Yes, mark as processed</Button>
        </div>
      </div>
    </Dialog>
  </div >
};

export default App;
