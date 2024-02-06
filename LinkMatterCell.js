import React from 'react';
import { withTranslation } from 'react-i18next';
import {Cell} from '../../../maintable/FixedDataTableRoot';
import {PlusCircleFilled} from '@ant-design/icons';
import './LinkCell.less';
import LinkMatterModal from '../../section/modal/LinkMatterModal';
import {CredentialContext} from '../../../CredentialContext';
import {parseBoardViewId,ModalTypes} from '../../../maintable/data/MainTableType';
import {TaskViewList,RelationModelStatus} from '../../columnlib/taskcolumns/TaskColumns';


@withTranslation()
class LinkMatterCell extends React.PureComponent {
    static contextType = CredentialContext;
    constructor(props) {
        super(props);
        this.state = {
            // boardId: props.value,
            isLoading: true,
            linkModalVisible: false,
            columnSettingLinkVisible: false,
            version: props.version,
            currentStatus:RelationModelStatus.READ_STATUS,
            isLinkBoardSelectModal:false,
            linkBoardId:'',
            linkBoardName:'',
            linkMirrorColumnId:null,
            LinkBoardRows:props.value,
        };
    }

    componentDidMount(){
        // const {data,rowIndex, columnKey} = this.props;
        // let rowId = data.getRowKey(rowIndex);
        // data._dataset.addRowLinkToBoard(data._boardId,columnKey,rowId,this.getLinkBoard); 
    }
    
    setLoading = (isLoading) => {
        this.setState({
          isLoading: isLoading,
        });
    }

    setMenus = (menus, isBoard, defaultBoard) => {
        let boardTitle;
        let boardColor;
        let boardId;
        if (defaultBoard) {
            boardTitle = defaultBoard.name;
            boardColor = defaultBoard.color;
            boardId = defaultBoard.boardId;
        }
        this.setState({
            boardTitle,
            boardColor,
            boardId,
            isLoading: false,
            board: defaultBoard
        });
    }

    handleCellFocus = (focused) => {
        if (this.props.onCellFocus) {
            this.props.onCellFocus(
            this.props.rowIndex,
            this.props.columnKey,
            focused
            );
        }
    }

    openLinkModal = (event) => {
        const {data, rowIndex, columnKey,modalType,handleUpdateModal} = this.props;
        if (modalType==ModalTypes.RELATION && handleUpdateModal) {
            return;
        } 
        let rowId = data.getRowKey(rowIndex);
        data._dataset.addRowLinkToBoard(data._boardId,columnKey,rowId,this.getLinkBoard).then(res=>{

            let bv = parseBoardViewId(res.linkBoardID)
            this.setState({  
                linkBoardId:bv.boardId+'-'+bv.viewId,
                linkModalVisible:true,
            });
            if (this.handleCellFocus) {
                this.handleCellFocus(true);
            }
        }); 
    }

    columnSettingClosed = (boardId) => {
        this.setState({ columnSettingLinkVisible: false });
        if (boardId) {
            this.setState({ linkModalVisible:true });
        }
    }
    
    linkModalClosed = () => {
        const {data, columnKey} = this.props;
        this.setState({ linkModalVisible: false });
        if (this.handleCellFocus) {
            this.handleCellFocus(false);
        } 
    }

    getLinkBoard = (linkBoardId) => {
        this.setState({
          linkBoardId:linkBoardId+'-'+TaskViewList.View_Status,
        })
    }

    render() {
        const {data, columnKey, rowIndex, siderWidth, isCellSelected, t, width, modalType,isReadonly} = this.props;
        let rowId = data.getRowKey(rowIndex);
        const {linkModalVisible} = this.state;
        const header = rowIndex?data.getLinkRowHeader(rowIndex):"";
        let value;

        let rowData = data.getObjectAt(rowIndex);
        let columnData = data.getColumn(columnKey);
        
        if(columnData){
            if (rowData && rowData[columnKey]) {
                value = rowData[columnKey].value;
            }
        }
        return (
            <Cell className="LinkCell" isCellSelected={isCellSelected}>
                <div className="LinkCell_list_center" style={{width}} onClick={this.openLinkModal.bind(this)}>
                    <div className="link_cell_icon" >{!isReadonly &&<PlusCircleFilled className={modalType==ModalTypes.RELATION?"relation_add_icon":"LinkCell_link_add_icon"}  />}</div>                                
                        { !!Number(value) && <span style={{color:'#0073bb'}}>{value + t('Buttons.item')}</span>}                   
                </div>
                <LinkMatterModal 
                    rowId={rowId}
                    isShowBoardLinkModal={linkModalVisible} 
                    data={data} 
                    columnKey={columnKey} 
                    rowIndex={rowIndex} 
                    header={header} 
                    onClosed={this.linkModalClosed} 
                    boardId={data._boardId} 
                    relationBoardId={this.state.linkBoardId} 
                    siderWidth={siderWidth} 
                    isReadonly={this.props.isReadonly}
                 />
                  
            </Cell>
            
        );
    }
}

export {LinkMatterCell};