import { lego } from '@armathai/lego';
import anime from 'animejs';
import { Container, Point, Sprite } from 'pixi.js';
import { Images } from '../assets';
import { BoardModelEvents, HintModelEvents } from '../events/ModelEvents';
import { BoardState } from '../models/BoardModel';
import { getViewByProperty, makeSprite } from '../utils';

export class HintView extends Container {
    private hand: Sprite;
    private hintPositions: Point[] = [];
    private currentPoint = 0;
    private boardState: BoardState;

    constructor() {
        super();

        lego.event
            .on(HintModelEvents.VisibleUpdate, this.onHintVisibleUpdate, this)
            .on(BoardModelEvents.StateUpdate, this.onBoardStateUpdate, this);

        this.build();
        this.hide();
    }

    get viewName() {
        return 'HintView';
    }

    public destroy(): void {
        this.removeTweens();
        lego.event.off(HintModelEvents.VisibleUpdate, this.onHintVisibleUpdate, this);
        lego.event.off(BoardModelEvents.StateUpdate, this.onBoardStateUpdate, this);

        super.destroy();
    }

    private onBoardStateUpdate(state: BoardState): void {
        this.boardState = state;
        this.removeTweens();
        this.hide();
    }

    private onHintVisibleUpdate(visible: boolean): void {
        visible ? this.show() : this.hide();
    }

    private build(): void {
        this.hand = makeSprite({ texture: Images['bubbles/hand'] });
        this.hand.anchor.set(0);
        this.addChild(this.hand);
    }

    private show(): void {
        this.removeTweens();
        this.hintPositions = this.getHintPosition();
        this.currentPoint = 0;

        this.showFirstTime();
    }

    private hide(): void {
        this.removeTweens();
        this.hand.visible = false;
    }

    private showFirstTime(): void {
        const point = this.hintPositions[this.currentPoint];
        this.hand.scale.set(0.5);
        this.hand.alpha = 1;
        this.hand.position.set(point.x, point.y);
        this.hand.angle = 0;
        this.hand.visible = true;

        this.pointHand();
    }

    private pointHand(): void {
        if (this.boardState === BoardState.Idle) {
            anime({
                targets: this.hand.scale,
                x: 0.4,
                y: 0.4,
                duration: 500,
                easing: 'easeInOutCubic',
                direction: 'alternate',
                begin: () => {
                    lego.event.emit('HintScaleDown', this.currentPoint);
                },
                complete: () => {
                    this.currentPoint += 1;
                    if (this.currentPoint >= this.hintPositions.length) {
                        this.currentPoint = 0;
                    }
                    this.moveHand(this.hintPositions[this.currentPoint]);
                },
            });
        } else if (this.boardState === BoardState.ShowMatch3) {
            anime({
                targets: this.hand.scale,
                x: 0.4,
                y: 0.4,
                duration: 250,
                easing: 'easeInOutCubic',
                complete: () => {
                    this.currentPoint += 1;
                    if (this.currentPoint >= this.hintPositions.length) {
                        this.currentPoint = 0;
                    }
                    this.moveHand(this.hintPositions[this.currentPoint]);
                },
            });
        }
    }

    private moveHand(pos): void {
        anime({
            targets: this.hand,
            x: pos.x,
            y: pos.y,
            duration: 500,
            easing: 'easeInOutCubic',
            complete: () => this.pointHand(),
        });
    }

    private removeTweens(): void {
        anime.remove(this.hand);
        anime.remove(this.hand.scale);
    }

    private getHintPosition(): Point[] {
        if (this.boardState === BoardState.Idle) {
            const board = getViewByProperty('viewName', 'BoardView');
            return board.getHintPositions().map((pos) => this.toLocal(pos));
        } else {
            const fg = getViewByProperty('viewName', 'ForegroundView');
            return fg.getHintPositions().map((pos) => this.toLocal(pos));
        }
    }
}
