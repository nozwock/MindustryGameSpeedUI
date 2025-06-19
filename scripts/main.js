let pinkColor = [Pal.lancerLaser, Pal.accent, Color.valueOf("cc6eaf")]; //Pink from BetaMindy

function createTimeControlWidget(table) {
    let currentGameSpeed = 0;
    // The speeds are power of 2.
    let speedRange = { lower: -1, upper: 2 };
    let timeButton, timeSlider;

    function setGameSpeedWithUI(v) {
        currentGameSpeed = v;
        if (timeButton) {
            timeButton.setText(toSpeedText(v));
        }
        setGameSpeed(Math.pow(2, v));
    }

    table.table(Tex.buttonEdge3, (table) => {
        table.name = "tc-slidertable";

        // Don't display the slider on mobile
        if (!Vars.mobile) {
            timeSlider = new Slider(
                speedRange.lower,
                speedRange.upper,
                1,
                false,
            );
            timeSlider.setValue(0);
        }

        timeButton = table
            .button("[accent]x1", () => {
                currentGameSpeed++;
                if (currentGameSpeed > speedRange.upper)
                    currentGameSpeed = speedRange.lower; // Cycling back
                currentGameSpeed = Mathf.clamp(
                    currentGameSpeed,
                    speedRange.lower,
                    speedRange.upper,
                );

                // log("Time button callback", curSpeed);
                if (timeSlider) {
                    timeSlider.setValue(currentGameSpeed);
                } else {
                    setGameSpeedWithUI(currentGameSpeed);
                }
            })
            .grow()
            .width(10.5 * 8)
            .get();
        timeButton.margin(0);
        {
            let style = timeButton.getStyle();
            style.up = Tex.pane;
            style.over = Tex.flatDownBase;
            style.down = Tex.whitePane;
        }

        let resetButton = table
            .button(new TextureRegionDrawable(Icon.refresh), 24, () => {
                // log("Reset button callback", 0);
                if (timeSlider) {
                    timeSlider.setValue(0);
                } else {
                    setGameSpeedWithUI(0);
                }
            })
            .padLeft(6)
            .get();
        resetButton.getStyle().imageUpColor = Pal.accent;

        if (!Vars.mobile) {
            table.add(timeSlider).padLeft(6).minWidth(132);
            timeSlider.moved((v) => {
                // log("Slider callback", v);
                setGameSpeedWithUI(v);
            });
        }
    });
    table.visibility = () => {
        if (!Vars.state.isGame() && timeSlider) {
            // Exited the map
            timeSlider.setValue(0);
        }
        return getGUIVisibility();
    };
}

// FIXME: Seems like setting game speed breaks logic for many subsystems? This
// pretty much seems to make the whole mod useless.
// https://github.com/sk7725/TimeControl/issues/39
function setGameSpeed(speed) {
    Time.setDeltaProvider(() =>
        Math.min(Core.graphics.getDeltaTime() * 60 * speed, 3 * speed),
    );
}

/// `speed` here is some power of 2.
function toSpeedText(speed) {
    Tmp.c1.lerp(pinkColor, (speed + 8) / 16);
    let text = "[#" + Tmp.c1.toString() + "]";
    if (speed >= 0) {
        text += "x" + Math.pow(2, speed);
    } else {
        text += "x1/" + Math.pow(2, Math.abs(speed));
    }
    return text;
}

function getGUIVisibility() {
    if (!Vars.ui.hudfrag.shown || Vars.ui.minimapfrag.shown()) return false;
    if (!Vars.mobile) return true;

    let input = Vars.control.input;
    return input.lastSchematic == null || input.selectPlans.isEmpty();
}

// Register mod
if (!Vars.headless) {
    Events.on(ClientLoadEvent, () => {
        let timeControlTable = new Table();
        timeControlTable.bottom().left();
        createTimeControlWidget(timeControlTable);
        Vars.ui.hudGroup.addChild(timeControlTable);

        if (Vars.mobile) {
            timeControlTable.moveBy(0, Scl.scl(46));
        }
    });
}
