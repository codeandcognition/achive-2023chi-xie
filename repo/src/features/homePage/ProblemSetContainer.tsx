import { FormGroup, FormControlLabel, Radio } from "@mui/material"
import { useNavigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { setProblemSet } from "../problemSets/problemSetsSlice"
import { getPS1Milestone, getPS2Milestone, getPS3Milestone } from "../progress/milestoneSlice"



const ProblemSetContainer: React.FC = () => {
    const PROBLEM_SET_1 = "/problem_set_1"
    const PROBLEM_SET_2 = "/problem_set_2"
    const PROBLEM_SET_3 = "/problem_set_3"


    const navigate = useNavigate()
    const dispatch = useAppDispatch()

    const ps1Milestone = useAppSelector(getPS1Milestone)
    const ps2Milestone = useAppSelector(getPS2Milestone)
    const ps3Milestone = useAppSelector(getPS3Milestone)

    //use dispatch to set problem to desired problem
    const clickProblemSet1 = () => {
        dispatch(setProblemSet("PS1"))
        navigate(PROBLEM_SET_1)
    }
    const clickProblemSet2 = () => {
        dispatch(setProblemSet("PS2"))
        navigate(PROBLEM_SET_2)
    }
    const clickProblemSet3 = () => {
        dispatch(setProblemSet("P3"))
        navigate(PROBLEM_SET_3)
    }

    let problemSet1Button = <FormControlLabel control={<Radio />} label="Problem Set 1" onClick={clickProblemSet1} />
    if (ps1Milestone) {
        problemSet1Button = <FormControlLabel control={<Radio defaultChecked />} label="Problem Set 1" onClick={clickProblemSet1} />
    }

    let problemSet2Button = <FormControlLabel control={<Radio />} label="Problem Set 1" onClick={clickProblemSet2} />
    if (ps2Milestone) {
        problemSet2Button = <FormControlLabel control={<Radio defaultChecked />} label="Problem Set 2" onClick={clickProblemSet2} />
    }

    let problemSet3Button = <FormControlLabel control={<Radio />} label="Problem Set 1" onClick={clickProblemSet3} />
    if (ps3Milestone) {
        problemSet3Button = <FormControlLabel control={<Radio defaultChecked />} label="Problem Set 3" onClick={clickProblemSet3} />
    }


    return (
        <FormGroup>
            {problemSet1Button}
            {problemSet2Button}
            {problemSet3Button}
        </FormGroup>
    )

}

export default ProblemSetContainer