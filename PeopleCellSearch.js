import React, { createRef } from 'react';
import 'antd/dist/antd.css';
import { Button, Input, Popover, Tag, Divider } from 'antd';
import { UserOutlined, PlusCircleFilled } from '@ant-design/icons';
import './PeopleCell.less';
import {
  compareUserValue,
  getCellSelectedStyle,
  getCellPopupHeight,
} from './CellProperties';
import { VISIBILITY, COLOR } from '../../section/header/StyleValues';
import { getMoreUserAvatar, getUserAvatar } from '../../../icons/UserAvatar';
import { ColumnType } from '../../../maintable/data/MainTableType';
import { withTranslation } from 'react-i18next';

export const PEOPLE = 'PEOPLESEARCH';
export const PEOPLESINGLE = 'PEOPLESEARCHSINGLE';

function getSelectedUsers(props) {
  let selectedUsers = props.value && props.value != '' ? props.value : [];
  //aws无people singin列,处理为[],不影响环境正常功能
  if (typeof selectedUsers != 'object') {
    selectedUsers = [];
  }
  return {
    selectedUsers,
  };
}

@withTranslation()
class PeopleCellSearch extends React.PureComponent {
  constructor(props) {
    super(props);
    let selectedUserData = getSelectedUsers(props);
    this.state = {
      visible: false,
      userList: [],
      oldSelectedUsers: selectedUserData.selectedUsers || [],
      selectedUsers: selectedUserData.selectedUsers || [],
      // container: props.container,
      removeBar: {
        visibility: VISIBILITY.HIDDEN,
      },
      rowIndex: props.rowIndex,
      isSingle: props.isSingle,
      selectedStyle: {},
      nameTypes: ['username', 'lname'],
      type: 1,
    };
    this.searchInputRef = createRef();
    //this._popupRef = createRef();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let selectedUserData = getSelectedUsers(nextProps);
    let isChanged = compareUserValue(
      prevState.oldSelectedUsers.slice(),
      selectedUserData.selectedUsers.slice()
    );
    if (isChanged || nextProps.rowIndex != prevState.rowIndex) {
      return {
        selectedUsers: selectedUserData.selectedUsers,
        oldSelectedUsers: selectedUserData.selectedUsers,
        rowIndex: nextProps.rowIndex,
      };
    }
    return null;
  }

  showUserPanel = () => {
    this.setState({
      visible: true,
    });
  };

  filterPeople = () => {
    let value = this.searchInputRef.current.input.value;
    let type = /^\d.*$/.test(value) ? 1 : 2;
    if (value) {
      let valueLow = value.trim().toLowerCase();
      this.props.data.getSearchUser(value, type).then((res) => {
        let userList = res;
        let selectedUsers = this.state.selectedUsers;
        //aws无people singin列,处理为[],不影响环境正常功能
        if (typeof selectedUsers != 'object') {
          selectedUsers = [];
        }
        if (userList.length > 0) {
          for (let i = 0; i < selectedUsers.length; i++) {
            const selectedUser = selectedUsers[i];
            let userIndex = userList.findIndex(
              (user) => user.id === selectedUser.id
            );
            if (userIndex >= 0) {
              userList.splice(userIndex, 1);
            }
          }
        }

        this.setState({
          type,
          userList,
          filterValue: valueLow,
        });
      });
    } else {
      this.setState({
        filterValue: null,
      });
    }
  };

  /**
   * 选择用户
   * @param {*} selectUser
   */
  handleUserClick = (selectUser) => {
    const isSingle = this.state.isSingle;
    let userList = this.state.userList.slice();
    let selectedUsers = this.state.selectedUsers.slice();
    if (isSingle) {
      selectedUsers.map((item) => {
        let name = item[
          this.state.nameTypes[this.state.type - 1]
        ].toLowerCase();
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
    let userIndex = selectedUsers.findIndex(
      (user) => user.id === removeUser.id
    );
    selectedUsers.splice(userIndex, 1);
    let userList = this.state.userList.slice();
    // console.log(removeUser[this.state.nameTypes[this.state.type-1]])
    let name = removeUser[
      this.state.nameTypes[this.state.type - 1]
    ].toLowerCase();
    if (name.indexOf(this.state.filterValue) !== -1) {
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
    const isSingle = this.state.isSingle;
    let popupHeight;
    if (isSingle) {
      popupHeight = getCellPopupHeight(ColumnType.PEOPLESEARCHSINGLE);
    } else {
      popupHeight = getCellPopupHeight(ColumnType.PEOPLESEARCH);
    }
    this.props.handleCellEdit(ColumnType.PEOPLESEARCH, popupHeight);
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
      this.peopleRef.scrollTop--;
    }
    if (deta < 0) {
      this.peopleRef.scrollTop++;
    }
  };

  render() {
    const { selectedUsers, userList, selectedStyle } = this.state;
    const { isReadonly, t } = this.props;
    const { Search } = Input;
    let users = userList;
    const showRemoveUserBar = () => {
      const visibility =
        this.state.selectedUsers.length < 1
          ? VISIBILITY.HIDDEN
          : VISIBILITY.VISIBLE;
      this.setState({
        removeBar: {
          visibility,
        },
      });
    };
    const hideRemoveUserBar = () => {
      this.setState({
        removeBar: {
          visibility: VISIBILITY.HIDDEN,
        },
      });
    };

    const handleCellEnter = () => {
      if (this.props.handleCellFocus) {
        this.props.handleCellFocus(true);
      }
    };

    const handleCellLeave = () => {
      if (this.props.handleCellFocus) {
        this.props.handleCellFocus(false);
      }
    };

    const width = 200;
    let filterStyle = {};

    if (this.props.filterInputValue) {
      let filterInputValue = this.props.filterInputValue.toLowerCase();
      selectedUsers.map((user) => {
        if (
          user[this.state.nameTypes[this.state.type - 1]] &&
          user[this.state.nameTypes[this.state.type - 1]]
            .toLowerCase()
            .indexOf(filterInputValue) !== -1
        ) {
          filterStyle = { backgroundColor: COLOR.CELL_FILTER_BG };
          return;
        }
      });
    }
    return (
      <div
        className="people_cell"
        style={Object.assign({}, filterStyle, selectedStyle)}
      >
        {/* {isReadonly && selectedUsers.map((user, i) => getUserAvatar(25, {}, user, i))}
        {!isReadonly && ( */}
        <Popover
          placement="bottomRight"
          trigger="click"
          destroyTooltipOnHide="true"
          autoAdjustOverflow={false}
          onVisibleChange={this.handleChangeVisible}
          getPopupContainer={(trigger) =>
            this.props.container ? this.props.container : trigger.parentElement
          }
          overlayClassName="people_search_pop"
          ref={this._onRef}
          content={
            <div
              style={{ pointerEvents: 'visible', width }}
              onMouseEnter={handleCellEnter}
              onMouseLeave={handleCellLeave}
            >
              <Divider className="dividerStyle">People</Divider>
              <div
                ref={(ref) => {
                  this.peopleRef = ref;
                }}
                className="user_scroll"
                onWheel={this.handleWheel}
                style={users.length === 5 ? { overflowY: 'scroll' } : {}}
              >
                {users.map((v, i) => (
                  <div
                    key={i}
                    className="user"
                    onClick={this.handleUserClick.bind(this, v)}
                  >
                    <div className="faceAvatar">
                      &nbsp;
                      {getUserAvatar(25, {}, v, i)}
                      &nbsp;
                      {`${v.lname}(${v.fname})`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          }
          title={
            <div style={{ pointerEvents: 'visible', width }}>
              <div
                style={{
                  paddingBottom: '10px',
                  display: 'flex',
                  flexWrap: 'wrap',
                }}
              >
                {selectedUsers.map((v, i) => (
                  <Tag
                    key={i}
                    closable={!isReadonly}
                    className="userTag"
                    onClose={this.handleUserRemove.bind(this, v)}
                  >
                    {getUserAvatar(22, {}, v, i)}
                    &nbsp;{`${v.lname}(${v.fname})`}
                  </Tag>
                ))}
              </div>
              {!isReadonly && (
                <Search
                  ref={this.searchInputRef}
                  placeholder={t('InputPlaceholder.input_name_or_no')}
                  bordered="false"
                  onSearch={this.filterPeople}
                  className="searchInput"
                  allowClear
                />
              )}
            </div>
          }
        >
          {selectedUsers.length > 0 && (
            <div
              onMouseEnter={showRemoveUserBar}
              onMouseLeave={hideRemoveUserBar}
              style={{ display: 'flex' }}
            >
              <div className="userAvatar selected_user">
                {selectedUsers.length === 1 &&
                  (<div>{getUserAvatar(25, {}, selectedUsers[0], null, 'Avatar')}<span>{selectedUsers[0].displayname}</span></div>)}
                {selectedUsers.length === 2 && (
                  <div>
                    {getUserAvatar(
                      25,
                      { left: '3px' },
                      selectedUsers[0],
                      '0',
                      'Avatar'
                    )}
                    {getUserAvatar(
                      25,
                      { right: '3px' },
                      selectedUsers[1],
                      '1',
                      'Avatar'
                    )}
                  </div>
                )}
                {selectedUsers.length > 2 && (
                  <div>
                    {getUserAvatar(
                      25,
                      { left: '3px' },
                      selectedUsers[0],
                      null,
                      'Avatar'
                    )}
                    {getMoreUserAvatar(
                      25,
                      {},
                      selectedUsers.length - 1,
                      'Avatar moreUserAvatar'
                    )}
                  </div>
                )}
                {!isReadonly && (
                  <PlusCircleFilled
                    className="PlusCircleFilled"
                    style={{
                      marginLeft: selectedUsers.length === 1 ? -40 : -60,
                    }}
                  />
                )}
              </div>
              {/* <div className="clear_user">
                  <CloseCircleFilled
                    className="CloseCircleFilled"
                    onClick={this.handleUserClear}
                    style={this.state.removeBar}
                    onMouseEnter={showRemoveUserBar}
                    onMouseLeave={hideRemoveUserBar}
                  />
                </div> */}
            </div>
          )}
          {selectedUsers.length < 1 && (
            <div className="userAvatar">
              <Button
                className="userIcon"
                shape="circle"
                size="small"
                icon={<UserOutlined />}
              />
              {!isReadonly && (
                <PlusCircleFilled
                  className="PlusCircleFilled"
                  style={{ marginLeft: -40, marginTop: 6 }}
                />
              )}
            </div>
          )}
        </Popover>
        {/* )} */}
      </div>
    );
  }
}

export { PeopleCellSearch };
