<?php

class Priority 
{
    public function all($parameters)
    {
        // Connect Database
        $Dbobj = new DBConnection(); 
        $mysqli = $Dbobj->getDBConnect();

        // Query - Standard osTicket table for priorities
        $getPriorities = $mysqli->query("SELECT priority_id as id, priority_desc as name, priority_urgency as urgency FROM ".TABLE_PREFIX."ticket_priority ORDER BY priority_urgency ASC");

        // Array that stores all results
        $result = array();
        if ($getPriorities) {
            $numRows = $getPriorities->num_rows;

            // Fetch data
            while($PrintPriorities = $getPriorities->fetch_object())
            {
                array_push($result,
                    array(
                        'id'=>$PrintPriorities->id,
                        'name'=>utf8_encode($PrintPriorities->name),
                        'urgency'=>$PrintPriorities->urgency
                    ));   
            }
        }

        // build return array
        $returnArray = array('total' => count($result), 'priorities' => $result); 

        // Return values
        return $returnArray;  
    }
}
?>
