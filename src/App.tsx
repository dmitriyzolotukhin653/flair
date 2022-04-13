import React from "react";
import {
  Button,
  ButtonGroup,
  Card,
  FormGroup,
  NumericInput
} from "@blueprintjs/core";
import { useFormik } from "formik";

class Frame {
  score = [0, 0];

  get total() {
    return this.score[0] + this.score[1];
  }

  get isStrike() {
    return this.score[0] === 10;
  }

  get isSpare() {
    return this.total === 10 && !this.isStrike;
  }
}

const INITIAL_SCORE = new Map(
  Array.from(Array(10).keys()).map((_, i) => [i, new Frame()])
);

const App: React.FC = () => {
  const [currentFrame, setCurrentFrame] = React.useState(0);
  const { values, setFieldValue } = useFormik({
    initialValues: {
      score: INITIAL_SCORE
    },
    onSubmit(values) {
      // console.log("values", values);
    }
  });
  const getScore = (frameIndex: number) => {
    const frame = values.score.get(frameIndex);
    if (!frame) {
      return 0;
    }
    let score = frame.total;
    if (frame.isStrike) {
      const nextFrame = values.score.get(frameIndex + 1);
      const nextFrameTotal = nextFrame ? nextFrame.total : 0;
      const nextNextFrame = values.score.get(frameIndex + 2);
      const nextNextFrameTotal = nextNextFrame ? nextNextFrame.total : 0;
      score += nextFrame?.isStrike
        ? nextFrameTotal + nextNextFrameTotal
        : nextFrameTotal;
      return score;
    }
    if (frame.isSpare) {
      const nextFrame = values.score.get(frameIndex + 1);
      const nextFrameTotal = nextFrame ? nextFrame.score[0] : 0;
      score += nextFrameTotal;
      return score;
    }
    return score;
  };
  console.log("values", values.score);
  const all = Array.from(values.score.entries()).reduce(
    (previousValue, [i]) => previousValue + getScore(i),
    0
  );
  const frame = values.score.get(currentFrame);
  const total = getScore(currentFrame);
  return (
    <div className="wrapper">
      <Button large onClick={() => {
        setFieldValue('score', INITIAL_SCORE);
        setCurrentFrame(0);
      }}>New game</Button>
      <h1>Total results: {all}</h1>
      <ButtonGroup fill large>
        {Array.from(values.score).map(([i, frame]) => (
          <Button key={i} intent={i === currentFrame ? "primary" : "none"}>
            {frame.score[0]} + {frame.score[1]} ({getScore(i)})
          </Button>
        ))}
      </ButtonGroup>
      {frame && (
        <Card key={currentFrame}>
          <h3>Frame #{currentFrame + 1}</h3>
          <h4>Total: {total}</h4>
          {frame.isStrike && (
            <div>
              It's a Strike!
              <br />
            </div>
          )}
          {frame.isSpare && (
            <div>
              It's a Spare!
              <br />
            </div>
          )}
          {frame.score.map((s, j) => (
            <FormGroup label={`Attempt #${j + 1}`}>
              <NumericInput
                disabled={j > 0 && frame.score[0] === 10 && currentFrame !== 9}
                key={j}
                max={10}
                min={0}
                value={frame.score[j]}
                onValueChange={value => {
                  console.log("e", value);
                  frame.score[j] = value;
                  values.score.set(currentFrame, frame);
                  return setFieldValue("score", values.score);
                }}
              ></NumericInput>
            </FormGroup>
          ))}
          <Button onClick={() => setCurrentFrame(currentFrame + 1)}>
            Next
          </Button>
        </Card>
      )}
    </div>
  );
};

export default App;
