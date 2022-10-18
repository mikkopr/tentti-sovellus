
const ExamMenuItem = (props) => 
{
    return (
        <div className="exam-menu-item"
            /*onClick={(event) => props.dispatch(
                {type: 'EXAM_MENU_ITEM_CLICKED',
                payload: {itemIndex: props.itemIndex} }
            )}*/
        >
            {props.examName}
        </div>
    );
}

export default ExamMenuItem;
