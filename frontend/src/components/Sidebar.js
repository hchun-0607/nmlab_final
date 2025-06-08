import React, { useState, useEffect } from "react";
import SimpleBar from 'simplebar-react';
import { useLocation, Link} from "react-router-dom";
import { CSSTransition } from 'react-transition-group';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faBoxOpen, faChartPie, faCog,faUtensils, faHandHoldingUsd, faSignOutAlt, faTable, faUser} from "@fortawesome/free-solid-svg-icons";
import { Nav, Badge, Image, Button, Dropdown, Accordion, Navbar } from '@themesberg/react-bootstrap';

import { useChat } from "../api/context";
import { Routes } from "../routes";

export default (props = {}) => {
  const location = useLocation();
  const { pathname } = location;
  const {userData, setUserData} = useChat();
  
  const CollapsableNavItem = (props) => {
    const { eventKey, title, icon, children = null } = props;
    const defaultKey = pathname.indexOf(eventKey) !== -1 ? eventKey : "";
    return (
      <Accordion as={Nav.Item} defaultActiveKey={defaultKey}>
        <Accordion.Item eventKey={eventKey}>
          <Accordion.Button as={Nav.Link} className="d-flex justify-content-between align-items-center">
            <span>
              <span className="sidebar-icon"><FontAwesomeIcon icon={icon} /></span>
              <span className="sidebar-text">{title}</span>
            </span>
          </Accordion.Button>
          <Accordion.Body className="multi-level">
            <Nav className="flex-column">
              {children}
            </Nav>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    );
  };

  //prevent the state fom losing when refreshing the page
  useEffect(() => {
    if(userData.Username !== ""){
      window.localStorage.setItem('data',JSON.stringify(userData));
    }
  });

  useEffect(() => {
    if(typeof(window.localStorage.getItem('data')) !=="undefined"){
      setUserData(JSON.parse(window.localStorage.getItem('data')))
    }
  }, []);
  

  const NavItem = (props) => {
    const { title, tag, permission, link, external, target, icon, image, badgeText, badgeBg = "secondary", badgeColor = "primary" } = props;
    const classNames = badgeText ? "d-flex justify-content-start align-items-center justify-content-between" : ""; //add a small icon like pro to an element of sidebar
    const navItemClassName = link === pathname ? "active" : "";
    const linkProps = external ? { href: link } : { as: Link, to: link };

    return (
      <Nav.Item className={navItemClassName} >
        <Nav.Link {...linkProps} target={target} className={classNames}>
          <span>
            {icon ? <span className="sidebar-icon"><FontAwesomeIcon icon={icon} /> </span> : null}
            {image ? <Image src={image} width={20} height={20} className="sidebar-icon svg-icon" /> : null}
            {/* {tag === "tag"?<span className="sidebar-text">您好 ! {title} / {permission === 1    ? "Super User" : "Normal User"}</span> */}
            {tag === "tag"?<span className="sidebar-text">您好 ! {title} </span>
            :
            <span className="sidebar-text">{title}</span>
            }
          </span>
          {badgeText ? (
            <Badge pill bg={badgeBg} text={badgeColor} className="badge-md notification-count ms-2">{badgeText}</Badge>
          ) : null}
        </Nav.Link>
      </Nav.Item>
    );
  };

  return (
    <>
      <CSSTransition timeout={300}  classNames="sidebar-transition">
        <SimpleBar className={`collapse show sidebar d-md-block bg-primary text-white`}>
          {/* px : distance to the left, pt : distance to the top */}
          <div className="sidebar-inner px-4 pt-3"> 
            <Nav className="flex-column pt-3 pt-md-0">
              <NavItem title={userData.Username} permission = {userData.Permission} tag="tag"  />
              <NavItem title="首頁" link={Routes.DashboardOverview.path} icon={faChartPie} />
              
              {/* <NavItem title="財會系統" icon={faHandHoldingUsd} link={Routes.Transactions.path} /> */}
              <CollapsableNavItem eventKey="reserves/" title="立即訂位" icon={faUtensils}>
                <NavItem title="餐廳列表" link={Routes.Restaurant.path}  /> 
                <NavItem title="直接訂位" link={Routes.Reserve.path}  /> 
              </CollapsableNavItem>  
              {/* <CollapsableNavItem eventKey="examples/" title="訂位資訊" icon={faCog}> */}
              <NavItem title="歷史訂位資訊" link={Routes.Reservations.path} icon={faTable} /> 
              {/* </CollapsableNavItem>             */}
              <CollapsableNavItem eventKey="tables/" title="使用者資訊" icon={faUser}>
                <NavItem title="錢包資訊" link={Routes.Walletsetting.path} /> 
                <NavItem title="編輯個人資料" link={Routes.Usersetting.path} />
              </CollapsableNavItem>
             
              <NavItem title="登出" link={Routes.Presentation.path} icon={faSignOutAlt} />
              <Dropdown.Divider className="my-3 border-indigo" />


              
            </Nav>
          </div>
        </SimpleBar>
      </CSSTransition>
    </>
  );
};
