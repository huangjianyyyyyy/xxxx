import React from 'react';
import { withTranslation } from 'react-i18next';
import {Cell} from '../../../maintable/FixedDataTableRoot';
import {PlusCircleFilled} from '@ant-design/icons';
import './LinkCell.less';
// import LinkBoardModal from '../../section/modal/LinkBoardModal';
import TaskFlowModal from '../../section/modal/TaskFlowModal';
import {CredentialContext} from '../../../CredentialContext';
import {parseBoardViewId,ModalTypes} from '../../../maintable/data/MainTableType';

//import {connect} from 'react-redux';

// import {
//     dealBoardLinkModal,
//   } from '../../../maintable/actions/cellActions';

//@connect(null, {dealBoardLinkModal})
@withTranslation()
class TaskFlowCell extends React.PureComponent {
    static contextType = CredentialContext;
    constructor(props) {
        super(props);
        this.state = {
            // boardId: props.value,
            isLoading: true,
            linkModalVisible: false,
            columnSettingLinkVisible: false,
            version: props.version,
            rowId:null
        };
    }

    componentDidMount(){
        if (this.props.value && !this._initialized) {
            const rows = this.props.data._dataset.getRowData(this.props.value);
            const bv = parseBoardViewId(this.props.data._boardId);
            if (!rows) {
                this.props.data._dataset.fetchBoardData(this.props.value, bv.viewId, this.setMenus, this.setLoading);
            }
        }
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

    openLinkModal = (event) => {
        const {data,modalType,value,rowIndex,columnKey,handleUpdateModal,navigateBoardCallback,handleCellFocus} =this.props;
        if (modalType==ModalTypes.RELATION && handleUpdateModal) {

            handleUpdateModal(true,data,rowIndex,null,true);
         
            return;
        }
        event.stopPropagation();


        let rowId = data.getRowKey(rowIndex);
        const header = data._dataset.getLinkRowHeader(data._boardId,rowId);
        const row = data._dataset.getObjectAt(data._boardId, rowId);
        if (row) {
            const boardId = row[columnKey] && row[columnKey].value;
            if(!boardId){
                data._dataset.createLinkData(rowId,columnKey).then(res=>{

                    if (navigateBoardCallback) {             
                        navigateBoardCallback(data._boardId, value, false, data, rowId, columnKey,header);
                        return;
                    }
                    this.setState({linkModalVisible:true,rowId:rowId});
                    if (handleCellFocus) {
                        handleCellFocus(true);
                    }
                })
            }else{
                if (navigateBoardCallback) {             
                    navigateBoardCallback(data._boardId, value, false, data, rowId, columnKey,header);
                    return;
                }
                this.setState({linkModalVisible:true,rowId:rowId});
            }    
        }
       
    }

    columnSettingClosed = (boardId) => {
        this.setState({ columnSettingLinkVisible: false });
        if (boardId) {
            this.setState({ linkModalVisible:true });
        }
    }
    
    linkModalClosed = () => {
        this.setState({ linkModalVisible: false });
        if (this.props.handleCellFocus) {
            this.props.handleCellFocus(false);
        }
    }

    render() {
        const { t, width } = this.props;
        const {data, columnKey, rowIndex, siderWidth, isCellSelected,modalType} = this.props;
        const {linkModalVisible} = this.state;

        // const rows = data._dataset.getRowData(boardViewId);
        const header = data.getLinkRowHeader(rowIndex);
        let content;

        let value;

        let rowData = data.getObjectAt(rowIndex);
        let columnData = data.getColumn(columnKey);
        
        if(columnData){
            if (rowData && rowData[columnKey]) {
                value = rowData[columnKey].value;
            }
        }
        let rowId = data.getRowKey(rowIndex);

        return (
            <Cell className="LinkCell" isCellSelected={isCellSelected}>
                <div className="LinkCell_list_center" style={{width}} onClick={this.openLinkModal.bind(this)}>
                    <div className="link_cell_icon"><PlusCircleFilled className={modalType==ModalTypes.RELATION?"relation_add_icon":"LinkCell_link_add_icon"} /></div>
                    {value && (value.title?value.title : value.count && (value.count +'项'))} 
                </div>
                {rowId && <TaskFlowModal isShowBoardLinkModal={linkModalVisible} data={data} columnKey={columnKey} rowId={rowId} header={header} 
                    onClosed={this.linkModalClosed} boardId={data._boardId} siderWidth={siderWidth} isReadonly={this.props.isReadonly} />}
            </Cell>
        );
    }
}

export {TaskFlowCell};