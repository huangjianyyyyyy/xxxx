import React, { createRef } from 'react';
import BraftEditor from 'braft-editor';
import { ContentUtils } from 'braft-utils';
import { Popover, Tooltip, Button , message } from 'antd';
import { Cell } from '../../../maintable/FixedDataTableRoot';
import { getCellSelectedStyle } from './CellProperties';
import './BraftEditorCell.less';
import EditorLinkModal from '../../section/modal/EditorLinkModal';
import { LinkOutlined,EditOutlined } from '@ant-design/icons';
import { withTranslation } from 'react-i18next';

const maxStrLength = 1000;

@withTranslation()
class BraftEditorCell extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rowId:props.rowId,
      rowIndex:props.rowIndex,
      value:undefined,
      visible: false,
      selectedStyle: {},
      editorState: BraftEditor.createEditorState(props.value),
      editorControls: [
        'undo',
        'redo',
        'bold',
        'italic',
        'underline',
        'strike-through',
        'list-ol',
        'list-ul',
        // 'link'
      ],
      isShowLinkModal: false,
      isEdit:false
    };

    this.editorRef = createRef();
    this.popoverRef = createRef();
    this.editorDivRef = null;
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const {rowIndex,value}=nextProps;  
    if (prevState.value != value || rowIndex != prevState.rowIndex) {
      return {
        value:value,
        rowIndex:rowIndex,
        editorState: BraftEditor.createEditorState(value),
      };
    }
    return null;
  }

  handleEditorChange = (editorState) => {
    this.setState({ editorState });
  };
  // handBraftEditorFocus = () => {
  // };
  handleLinkModalVisible = (visible) => { 
    if(this.props.isReadonly){
      return
    }
    this.setState({
      isShowLinkModal: visible,
    });
  };

  showPopover = () => {
    if(this.props.isReadonly){
      return;
    }
    this.setState({
      visible: true,
    });
  };

  insertLink = (url, text) => {
    let editorState = ContentUtils.insertHTML(this.state.editorState, `<a href=${url} target="_blank">${text}</a>`);

    let editorStateNew = ContentUtils.insertText(editorState, ' ');

    this.setState({
      editorState: editorStateNew,
    });

    this.editorRef.current.requestFocus();
  };

  save = () => {
    const { t } = this.props;
    let htmlString = this.state.editorState
      .toHTML()
      // .replace(new RegExp('<p>', 'gm'), '')
      // .replace(new RegExp('</p>', 'gm'), '')
      .replace(new RegExp("\r\n", "g"), "<br/>");

    if (htmlString.length > maxStrLength ) {
      htmlString = htmlString.substr( 0 , maxStrLength );
      this.setState({
        editorState: BraftEditor.createEditorState(htmlString),
      });
      message.warning(t('ColumnCell.BraftEditorCell.max_length_limit'));
    }
    this.setState({
      isEdit: false,
      selectedStyle: {},
      value:htmlString,
    },()=>{
      this.props.handleChange(htmlString, true);
    });
  };

  handleVisibleChange = (visible) => {
    if(this.props.isReadonly){
      return;
    }
    if (visible) {
      this.setState({
        selectedStyle: getCellSelectedStyle(),
        isEdit:false
      });
      this.props.handleCellEdit('RICHTEXT', 0);
    } else {
      this.setState({
        selectedStyle: {},
        isShowLinkModal: false,
        isEdit:false
      });
      this.props.handleCellEditEnd();
    }
    this.setState({ visible },()=>{
      setTimeout(function() {      
        let DraftEditor = document.getElementsByClassName('public-DraftEditor-content');
        if(DraftEditor.length>0){
          for(let i in DraftEditor){
            DraftEditor[i] &&  DraftEditor[i].focus && DraftEditor[i].focus();
          }
        }       
      }, 200);
    });
  };

  formatBraftEditorHtml = (htmlString) => {
    let string_text = '',
      array = [],
      isOl = false,
      isUl = false;
    //有序列表转换
    if (htmlString.indexOf('<ol>') != -1) {
      isOl = true;
      array = htmlString.replace('<ol><li>', '</li><li>').replace('</li></ol>', '').split('</li><li>');
      //无序列表转换
    } else if (htmlString.indexOf('<ul>') != -1) {
      isUl = true;
      array = htmlString.replace('<ul><li>', '</li><li>').replace('</li></ul>', '').split('</li><li>');
    } else {
      return htmlString;
    }
    for (let i = 0; i < array.length; i++) {
      if (isOl) {
        if (i < 1) {
          string_text += array[i] + ' ';
        } else {
          string_text += i + '. ' + array[i] + ' ';
        }
      }
      if (isUl) {
        if (i < 1) {
          string_text += array[i] + ' ';
        } else {
          string_text += '● ' + array[i] + ' ';
        }
      }
    }
    return string_text;
  };

  handleCellEnter = () => {
    if (this.props.handleCellFocus) {
      this.props.handleCellFocus(true);
    }
    if(this.editorRef.current){
      this.editorDivRef = this.editorRef.current.containerNode.lastChild;
      this.editorDivRef.onwheel = this.handleWheel;
    }
    
  };

  handleCellLeave = () => {
    if (this.props.handleCellFocus) {
      this.props.handleCellFocus(false);
    }
  };

  //滚动
  handleWheel = (event) => {
    //判断鼠标滚轮的上下滑动
    let deltaY = event.deltaY;
    let scrollTop = this.editorDivRef.scrollTop;
    if (deltaY > 0) {
      scrollTop = scrollTop + 80;
    }
    if (deltaY < 0) {
      scrollTop = scrollTop - 80;
    }

    this.editorDivRef.scrollTop = scrollTop;
  };

  changeEdit = () => {
    const {isEdit} = this.state;
    this.setState({
      isEdit:!isEdit
    })
  }
  render() {
    const language = this.props.i18n.language;
    const { visible, editorState, selectedStyle, isShowLinkModal, editorControls, isEdit } = this.state;
    let cellText = this.state.value ? this.formatBraftEditorHtml(this.state.value).replace(/\r/g, ' ') : '';
    let cellTextSource = this.state.value ? this.state.value.replace(/\r/g, ' ') : '';
    const { t, cardMode } = this.props;
    return (
      <Cell className="BraftEditorCell" style={selectedStyle} isCellSelected={this.props.isCellSelected}>
        {!cardMode && <Popover
          destroyTooltipOnHide={true}
          trigger="click"
          placement="bottomRight"
          overlayStyle={{ width: 360, pointerEvents: 'visible' }}
          onClick={this.showPopover}
          visible={visible}
          onVisibleChange={this.handleVisibleChange}
          getPopupContainer={(trigger) => (this.props.container ? this.props.container : trigger.parentElement)}
          content={
            <div
              style={{ margin: '12px 16px' }}
              onMouseEnter={this.handleCellEnter}
              onMouseLeave={this.handleCellLeave}
            >
              {isEdit&&<div>
                <BraftEditor
                  language={language}
                  ref={this.editorRef}
                  value={editorState}
                  controls={editorControls}
                  onChange={this.handleEditorChange}
                  disabled={this.props.isReadonly}
                  contentClassName="BraftEditorCell_content"
                />
                <div className="BraftEditorCell_bottom" ref={this.popoverRef}>
                  <div className="BraftEditorCell_link_div">
                    <EditorLinkModal
                      visible={isShowLinkModal}
                      handleLinkModalVisible={this.handleLinkModalVisible}
                      insertLink={this.insertLink}
                      autoAdjustOverflow={true}
                      container={this.popoverRef.current}
                      isColumn={true}
                    >
                      <span onClick={this.handleLinkModalVisible.bind(this, true)} className="BraftEditorCell_link_span">
                        <LinkOutlined />
                        {t('ColumnCell.BraftEditorCell.link')}
                      </span>
                    </EditorLinkModal>
                  </div>
                  <div className="BraftEditorCell_save_div">
                    <Button type="primary" className="BraftEditorCell_save" onClick={this.save}>
                    {t('ColumnCell.BraftEditorCell.save')}
                    </Button>
                  </div>
                </div>
              </div>
              }
              {
                !isEdit&&<div>
                  <div className="BraftEditorCell_btn_div"><Tooltip title="点击编辑"><Button type="link" icon={<EditOutlined/>} onClick={this.changeEdit}></Button></Tooltip></div>
                  <div className="BraftEditorCell_read_div" dangerouslySetInnerHTML={{ __html: cellTextSource }}></div>
                </div>
              }
            </div>
            
          }
        >
          {cellText && cellText != '' ? (
            <Tooltip
              placement="top"
              title={<div dangerouslySetInnerHTML={{ __html: cellTextSource }}></div>}
              arrowPointAtCenter
            >
              {/* style="width:200px;overflow:hidden;white-wrap:nowrap;text-overflow:ellipsis;" */}
              <div className="BraftEditorCell_div" style={{width:this.props.width-4+'px'}}  dangerouslySetInnerHTML={{__html: this.state.editorState.toText()}}></div>
            </Tooltip>
          ) : (
            <div className="BraftEditorCell_div" >{cellTextSource}</div>
          )}
        </Popover>}
        {cardMode && <div
              onMouseEnter={this.handleCellEnter}
              onMouseLeave={this.handleCellLeave}
              // onClick={this.handBraftEditorFocus}
            >
             
                {
                  isEdit&&<div>
                    <BraftEditor
                      language={language}
                      ref={this.editorRef}
                      value={editorState}
                      controls={editorControls}
                      onChange={this.handleEditorChange}
                      disabled={this.props.isReadonly}
                      contentClassName="BraftEditorCell_content"
                    />
                    <div className="BraftEditorCell_bottom" ref={this.popoverRef}>
                      <div className="BraftEditorCell_link_div">
                        <EditorLinkModal
                          visible={isShowLinkModal}
                          handleLinkModalVisible={this.handleLinkModalVisible}
                          insertLink={this.insertLink}
                          autoAdjustOverflow={true}
                          container={this.props.container}
                          isColumn={true}
                        >
                          <span onClick={this.handleLinkModalVisible.bind(this, true)} className="BraftEditorCell_link_span">
                            <LinkOutlined />
                            {t('ColumnCell.BraftEditorCell.link')}
                          </span>
                        </EditorLinkModal>
                      </div>
                      <div className="BraftEditorCell_save_div">
                        <Button type="primary" className="BraftEditorCell_save" onClick={this.save}>
                        {t('ColumnCell.BraftEditorCell.save')}
                        </Button>
                      </div>
                    </div>
                  </div>
                }
                {
                  !isEdit&&<div>
                    <div className="BraftEditorCell_btn_div"><Tooltip title="点击编辑"><Button type="link" icon={<EditOutlined/>} onClick={this.changeEdit}></Button></Tooltip></div>
                    <div className="BraftEditorCell_read_div" dangerouslySetInnerHTML={{ __html: cellTextSource }}></div>
                  </div>
                }
              </div>
              
             }
      </Cell>
    );
  }
}

export { BraftEditorCell };
