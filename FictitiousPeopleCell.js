import React from 'react';
import 'antd/dist/antd.css';
import { Button, Input, Popover, Tag, Divider } from 'antd';
import { UserOutlined, PlusCircleFilled } from '@ant-design/icons';
import './PeopleCell.less';
import { compareUserValue, getCellSelectedStyle } from './CellProperties';
import { VISIBILITY, COLOR } from '../../section/header/StyleValues';
import { getMoreUserAvatar, getUserAvatar } from '../../../icons/UserAvatar';
import { ColumnType } from '../../../maintable/data/MainTableType';

function getUserList(props) {
  let userList = props.data.getTeamUsers();
  let selectedUsers = props.value && props.value != '' ? props.value : [];
  //aws无people singin列,处理为[],不影响环境正常功能
  if (typeof selectedUsers != 'object') {
    selectedUsers = [];
  }
  for (let i = 0; i < selectedUsers.length; i++) {
    let selectedUser = selectedUsers[i];
    let userIndex = userList.findIndex((user) => user.id === selectedUser.id);
    if (userIndex >= 0) {
      userList.splice(userIndex, 1);
    }
  }
  return {
    userList,
    selectedUsers,
  };
}


class FictitiousPeopleCell extends React.PureComponent {
  constructor(props) {
    super(props);
    let userData = getUserList(props);
    this.state = {
      visible: false,
      userList: userData.userList,
      oldSelectedUsers: userData.selectedUsers || [],
      selectedUsers: userData.selectedUsers || [],
      // container: props.container,
      removeBar: {
        visibility: VISIBILITY.HIDDEN,
      },
      isSingle: props.isSingle,
      selectedStyle: {},
      nameTypes: ['username', 'lname'],
      type: 1,
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let userList = getUserList(nextProps);
    let isChanged = compareUserValue(prevState.oldSelectedUsers.slice(), userList.selectedUsers.slice());
    if (isChanged) {
      return {
        oldSelectedUsers: userList.selectedUsers,
        selectedUsers: userList.selectedUsers,
      }
    }
    return null;
  }


  showUserPanel = () => {
    this.setState({
      visible: true,
    });
  };

  getUserListBySelectedUsers = () => {
    // 用户原始列表
    let userList = this.props.data.getTeamUsers();

    // 排除选中的
    for (let i = 0; i < this.state.selectedUsers.length; i++) {
      let selectedUser = this.state.selectedUsers[i];
      let userIndex = userList.findIndex((user) => user.id === selectedUser.id);
      if (userIndex >= 0) {
        userList.splice(userIndex, 1);
      }
    }

    return userList;
  }

  /**
   * 选择用户
   * @param {*} selectUser
   */
  handleUserClick = (selectUser) => {
    const isSingle = this.state.isSingle;
    let userList = this.state.userList.slice();
    let selectedUsers = this.state.selectedUsers.slice();
    if (isSingle) {
      // 单人需要取用户全部列表
      userList = this.props.data.getTeamUsers();
      selectedUsers.map((item) => {
        let name = item[this.state.nameTypes[this.state.type - 1]].toLowerCase();
        if (name.indexOf(this.state.filterValue) !== -1) {
          userList.push(item);
        }
      });
      selectedUsers = [];
    }
    selectedUsers.push(selectUser);
    let userIndex = userList.findIndex((user) => user.id === selectUser.id);
    userList.splice(userIndex, 1);
    this.setState({
      selectedUsers,
      userList,
    });
    this.handleCellEdit();
  };

  /**
   * 移除用户
   * @param {*} e
   * @param {*} user
   */
  handleUserRemove = (removeUser) => {
    let selectedUsers = this.state.selectedUsers.slice();
    let userIndex = selectedUsers.findIndex((user) => user.id === removeUser.id);
    selectedUsers.splice(userIndex, 1);
    let userList = this.state.userList.slice();
    let name = removeUser[this.state.nameTypes[this.state.type - 1]].toLowerCase();
    // 还原的用户在过滤列表或没有过滤
    if (!this.state.filterValue || name.indexOf(this.state.filterValue) != -1) {
      userList.push(removeUser);
    }
    this.setState({
      selectedUsers,
      userList,
    });
  };

  /**
   * 清空用户
   */
  handleUserClear = () => {
    // 直接调用props的handleChange存储数据
    this.props.handleChange([], true);
    this.setState({
      selectedUsers: [],
    });
  };
  //弹框高度
  handleCellEdit = () => {
      setTimeout(() => {
        // const isSingle = this.state.isSingle;
        let refs = this.props.container.getElementsByClassName('ant-popover-content');
        let ref = refs[refs.length - 1];
        // let popupHeight;
        // if (isSingle) {
        //   popupHeight = getCellPopupHeight(ColumnType.PEOPLESINGLE);
        // } else {
        //   popupHeight = getCellPopupHeight(ColumnType.PEOPLE);
        // }
        this.props.handleCellEdit(ColumnType.PEOPLE, (ref.offsetHeight === 0 ? 280 : ref.offsetHeight) + 90);
      }, 200);
  };

  handleChangeVisible = (visible) => {
    // 消失时保存数据
    if (!visible) {
      this.setState({
        selectedStyle: {},
      });
      this.props.handleChange(this.state.selectedUsers, true);
      //this.props.handleCellEditEnd();
    } else {
      this.setState({
        selectedStyle: getCellSelectedStyle(),
      });
      //this.renderPopupHeight(this.state.selectedUsers, this.state.userList);
      this.handleCellEdit();
    }
  };

  _onRef = (div) => {
    this._popupRef = div;
  };
  //滚动
  handleWheel = (event) => {
    //判断鼠标滚轮的上下滑动
    let deta = event.deltaY;
    if (deta > 0) {
      this.peopleRef.scrollTop = this.peopleRef.scrollTop + 30;
    }
    if (deta < 0) {
      this.peopleRef.scrollTop = this.peopleRef.scrollTop - 30;
    }
  };

  getcellElement=()=>{
    const { selectedUsers } = this.state;

    if(selectedUsers.length===0){
      return (
        <div className="userAvatar">
          <Button className="userIcon" shape="circle" size="small" icon={<UserOutlined />} />
          {!this.props.isReadonly && <PlusCircleFilled className="PlusCircleFilled" style={{ marginLeft: -40, marginTop: 6 }} />}
        </div>
      )
    }else{
      return (
        <div  style={{ display: 'flex' }}>
          <div className="userAvatar selected_user">
            {selectedUsers.length <=2 && (
              <div>
                {selectedUsers.map(item=>{
                  return getUserAvatar(25, { left: '3px' }, item, null, 'Avatar')
                })}
              </div>
            )}
            {selectedUsers.length>2 &&(
              <div>
                {getUserAvatar(25, { left: '3px' }, selectedUsers[0], null, 'Avatar')}
                {getMoreUserAvatar(25, {}, selectedUsers.length - 1, 'Avatar moreUserAvatar')}
              </div>
            )}
            {!this.props.isReadonly &&<PlusCircleFilled
              className="PlusCircleFilled"
              style={{ marginLeft: selectedUsers.length === 1 ? -40 : -60 }}
            />}
          </div>
        </div>
      )
    }
  }
  addPerson =()=>{
    let {userList} = this.props;
    let fictitiousPerson ={...userList};
    let newPerson = {
      name:'用户'+ userList.length+1,
      id:userList.length+1,
    }
    fictitiousPerson.push(newPerson)
    this.setState({
      userList:fictitiousPerson
    })
  }
  render() {
    const { selectedUsers, userList, selectedStyle } = this.state;
    const { data, columnKey ,isReadonly} = this.props;
    const { Search } = Input;
    let users = userList;

    const width = 240;
    let filterStyle = {};

    if (this.props.filterInputValue) {
      let filterInputValue = this.props.filterInputValue.toLowerCase();
      selectedUsers.map((user) => {
        if (
          user[this.state.nameTypes[this.state.type - 1]] &&
          user[this.state.nameTypes[this.state.type - 1]].toLowerCase().indexOf(filterInputValue) !== -1
        ) {
          filterStyle = { backgroundColor: COLOR.CELL_FILTER_BG };
          return;
        }
      });
    }
    return (
      <div className="people_cell" style={Object.assign({}, filterStyle, selectedStyle)}>
        {(
          <Popover
            placement="bottomRight"
            trigger="click"
            destroyTooltipOnHide="true"
            autoAdjustOverflow={false}
            onVisibleChange={this.handleChangeVisible}
            getPopupContainer={(trigger) => this.props.container ? this.props.container : trigger.parentElement}
            ref={this._onRef}
            content={
              <div
                style={{ pointerEvents: 'visible', width }}
              >
                <Divider className="dividerStyle">虚拟用户</Divider>
                <div
                  ref={(ref) => {
                    this.peopleRef = ref;
                  }}
                  className="user_scroll"
                  onWheel={this.handleWheel}
                  style={users.length === 5 ? { overflowY: 'scroll' } : {}}
                >
                  {users.map((v, i) => (
                    <div key={i} className="user" onClick={this.handleUserClick.bind(this, v)}>
                      <div className="faceAvatar">
                        &nbsp;
                        {getUserAvatar(25, {}, v, i)}
                        &nbsp;
                        {v.lname}({v.username})
                      </div>
                    </div>
                  ))}
                </div>
                <div className='addPerson' onClick={this.addPerson}>新增</div>
              </div>
            }
            title={
              <div style={{ pointerEvents: 'visible', width }}>
                <div style={{ paddingBottom: '10px', display: 'flex', flexWrap: 'wrap' }}>
                  {selectedUsers.map((v, i) => (
                    <Tag key={i} closable className="userTag" onClose={this.handleUserRemove.bind(this, v)}>
                      {getUserAvatar(22, {}, v)}
                      &nbsp;{v.username}
                    </Tag>
                  ))}
                </div>
              </div>
            }
          >
            {this.getcellElement()}
          </Popover>
        )}
      </div>
    );
  }
}

export { FictitiousPeopleCell };
