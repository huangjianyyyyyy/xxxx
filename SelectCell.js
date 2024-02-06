import React,{createRef} from 'react';
import 'antd/dist/antd.css';
import { Select, Divider, Input } from 'antd';
import { withTranslation } from 'react-i18next';
import { Cell } from '../../../maintable/FixedDataTableRoot';
import './SelectCell.less';
// import { getCellSeclectList } from './CellProperties';
// import { TaskImportantness } from '../taskcolumns/TaskColumns';
import { ColumnType } from '../../../maintable/data/MainTableType';
import { CloseCircleFilled } from '@ant-design/icons';
import Keys from '../../../maintable/vendor_upstream/core/Keys';
const { Option } = Select;

@withTranslation()
class SelectCell extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
      rowId: props.rowId,
      rowIndex: props.rowIndex,
      searchValue: '',
      isEdit: false,
      isAdd: false,
      AddInputValue: '',
      SeclectCellList:
      props.data._dataset._columnData[props.data._boardId]&&props.data._dataset._columnData[props.data._boardId][props.columnKey],
      filterSelectList:
      props.data._dataset._columnData[props.data._boardId]&&props.data._dataset._columnData[props.data._boardId][props.columnKey],
    };
    this.editList = createRef();
    this.carouselRef = createRef();;
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let { rowIndex, value } = nextProps;
    const oldSeclectCellList =
    nextProps.data._dataset._columnData[nextProps.data._boardId]&&nextProps.data._dataset._columnData[nextProps.data._boardId][nextProps.columnKey];
    if (
      prevState.value != value ||
      rowIndex != prevState.rowIndex ||
      oldSeclectCellList != prevState.SeclectCellList
    ) {
      return {
        value: value,
        rowIndex: rowIndex,
        SeclectCellList: oldSeclectCellList,
        filterSelectList: oldSeclectCellList,
      };
    }
    return null;
  }

  selectChange = (value, option) => {
    if (this.props.handleChange) {
      this.props.handleChange(value, true);
    }
    this.carouselRef.current.blur()
    // if (this.props.handleHide) {
    //   this.props.handleHide()
    // }
  };

  selectIuputClear() {  
    this.props.handleChange("", true);  
  }  

  handleWheel (event) {  
    event.stopPropagation();  
    let deta = event.deltaY;  
    if (deta > 0) {  
    this.editList.current.scrollTop = this.editList.current.scrollTop + 30;  
    }  
    if (deta < 0) {  
    this.editList.current.scrollTop = this.editList.current.scrollTop - 30;  
    }  
  } 

  dropdownVisibleChange = (open) => {
    const { t,isReadonly } = this.props;
    if (isReadonly) {
      return
    }
    if (!open) {
      if (this.props.handleCellEditEnd) {
        this.props.handleCellEditEnd();
      }
    } else {
      if (this.props.handleCellEdit) {
        this.props.handleCellEdit(ColumnType.SELECT);
      }
    }
  };

  handleIuputSearch = (Input) => {
    const filterData = this.fuzzySearch(this.state.SeclectCellList, Input);
    this.setState({ filterSelectList: filterData, AddInputValue: Input });
    if (this.state.isEdit) {
      let isChange = this.state.SeclectCellList.find((item) => Input == item.value);
      if (!isChange && Input) {
        this.setState({ isAdd: true });
      } else {
        this.setState({ isAdd: false });
      }
    }
    this.setState({ searchValue: Input });
  };

  handleEdit = (type, e) => {
    const { AddInputValue, SeclectCellList } = this.state;
    const { columnKey, data } = this.props;
    e.stopPropagation();
    e.preventDefault();
    switch (type) {
      case 'edit':
        this.setState({ isEdit: !this.state.isEdit });
        let isChange = this.state.SeclectCellList.find(
          (item) => AddInputValue === item.value
        );
        if (!isChange && AddInputValue) {
          this.setState({ isAdd: true });
        }
        break;
      case 'save':
        this.setState({ isEdit: !this.state.isEdit });
        data.updateColumnEnumValue(SeclectCellList, columnKey);
        break;
      case 'add':
        this.handleAddColunmEnumValue();
        break;
    }
    //  this.setState({ isEdit: !this.state.isEdit });
    // this.handleIuputSearch(AddInputValue)
  };

  handleDeleteSelect = (id, value, e) => {
    const { columnKey, data } = this.props;
    e.stopPropagation();
    e.preventDefault();
    data.deleteColunmEnumValue(id, columnKey, value);
  };

  handleInputClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };

  handleInputChange = (id, e) => {
    const newList = [...this.state.SeclectCellList];
    newList.map((item) => {
      if (item.id === id) {
        item.value = e.target.value;
      }
    });
    this.setState({ SeclectCellList: newList });
  };

  selectInputKeyDown = (e) => {
    if (e.keyCode === Keys.RETURN) {
      if (!this.state.isEdit) {
        this.props.handleKey(e);
        const findData = this.fuzzySearch(this.state.SeclectCellList, e.target.value);
        if (findData[0]) {
          this.props.handleChange(findData[0].id, true);
          this.setState({ value: findData[0].value });
        }
      } else if (this.state.isAdd) {
        this.handleAddColunmEnumValue();
      }
    }
  };

  handleAddColunmEnumValue() {
    const { AddInputValue, SeclectCellList } = this.state;
    const { columnKey, data } = this.props;
    this.setState({ isAdd: false, searchValue: '', filterSelectList: SeclectCellList });
    data.addColunmEnumValue(columnKey, {
      value: AddInputValue,
      color: '#111111',
      ranknum: SeclectCellList.length + 1,
      doneFlag: 0,
      category: 1,
    });
  }

  fuzzySearch(list, keyWord) {
    const reg = new RegExp(keyWord);
    const arr = [];
    for (var i = 0; i < list.length; i++) {
      if (reg.test(list[i].value)) {
        arr.push(list[i]);
      }
    }
    return arr;
  }

  render() {
    const { isEdit, isAdd, SeclectCellList, filterSelectList , value} = this.state;
    const { t,isReadonly ,data} = this.props;
    const boardManager = data.getCurrentBoard()?.boardManager;

    return (
      <Cell  className='SelectCell'>
        <>
          <Select
            disabled={isReadonly}
            allowClear={value?true:false}
            size='small'
            showSearch
            defaultActiveFirstOption={false}
            searchValue={this.state.searchValue}
            value={value}
            className='SelectCell'
            dropdownStyle={{ pointerEvents: 'visible' }}
            getPopupContainer={(trigger) =>
              this.props.container ? this.props.container : trigger.parentElement
            }
            // onClick={(e)=>e.stopPropagation()}
            onInputKeyDown={this.selectInputKeyDown}
            bordered={false}
            showArrow={false}
            ref={this.carouselRef}
            // autoFocus={true}
            // placeholder='Select a option'
            optionFilterProp='children'
            filterOption={(input, option) =>
              option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            onSelect={(value, option) => this.selectChange(value, option)}
            defaultOpen={false}
            onClear={this.selectIuputClear.bind(this)}
            optionLabelProp='label'
            onDropdownVisibleChange={this.dropdownVisibleChange}
            onSearch={(input) => this.handleIuputSearch(input)}
            dropdownRender={(menu) => (
              <div>
                <div className="SelectCell-select-dropdown" ref={this.editList} onWheel={this.handleWheel.bind(this)}>
                  {!isEdit
                    ? menu
                    : filterSelectList &&
                      filterSelectList.map((item) => {
                        return (
                          <Input.Group
                            style={{ pointerEvents: 'visible' }}
                            className='Select-group-compact'
                            
                            compact
                          >
                            <Input
                              className='Select-group-input'
                              style={{ width: '80%' }}
                              onClick={this.handleInputClick.bind(this)}
                              onChange={this.handleInputChange.bind(this, item.id)}
                              bordered={false}
                              value={item.value}
                            />
                            <CloseCircleFilled
                              // style={{width:"10%"}}
                              onClick={this.handleDeleteSelect.bind(
                                this,
                                item.id,
                                item.value
                              )}
                              className='Select_Close_CircleFilled'
                            />
                          </Input.Group>
                        );
                      })}
                </div>
                {boardManager &&
                <>
                  <Divider style={{ margin: '4px 0' }} />
                  <div style={{ textAlign: 'center', cursor: 'pointer', color: '#0073BB' }}>
                    {!isEdit ? (
                      <div onClick={this.handleEdit.bind(this, 'edit')}>
                        {t('Batch.edit')}
                      </div>
                    ) : isAdd ? (
                      <div onClick={this.handleEdit.bind(this, 'add')}>
                        {t('Batch.add')}
                      </div>
                    ) : (
                      <div onClick={this.handleEdit.bind(this, 'save')}>
                        {t('TooltipMsg.save_btn_text')}
                      </div>
                    )}
                  </div>
                </>
                }
              </div>
            )}
          >
            {SeclectCellList &&
              SeclectCellList.map((item) => {
                return (
                  <>
                    <Option
                      className='select_option_item'
                      value={item.id}
                      key={item.id}
                      label={item.value}
                    >
                      <div>{item.value}</div>
                    </Option>
                  </>
                );
              })}
          </Select>
        </>
      </Cell>
    );
  }
}

export { SelectCell };
