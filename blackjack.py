import hashlib
from datetime import datetime
import json
import random
import os
from flask import Flask, Response, render_template

__author__ = 'aleksandarvaricak'

basedir = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)
app.debug = False

PLAYERS = 3


def json_rep(obj, exclude_fields=None, include_fields=None):

    def repr_object(object_to_convert):
        """Return JSON representation of the passed object.

        This method convert given object into it`s JSON representation.
        It considers just attributes of the class that have type of
        sqlalchemy.orm.attributes.InstrumentedAttribute.

        Args:
            object_to_convert: Object to be converted to JSON. That object should be instance of
                some of our model class.

        Returns:
            repr: JSON representation of the object.
        """

        if type(object_to_convert) in (str, int, bool):
            return object_to_convert
        if type(object_to_convert) == datetime:
            return object_to_convert.strftime('%d-%b-%Y %H:%M')
        if type(object_to_convert) in [dict]:
            return {key: json_rep(object_to_convert[key], exclude_fields, include_fields) for key in object_to_convert}
        if not hasattr(object_to_convert, "__dict__"):
            return ""
        representation = {}
        for i in object_to_convert.__dict__:
            if include_fields and object_to_convert.__class__ in include_fields:
                include = include_fields[object_to_convert.__class__]
                if include:
                    if i not in include:
                        continue
            if exclude_fields and object_to_convert.__class__ in exclude_fields:
                exclude = exclude_fields[object_to_convert.__class__]
                if exclude:
                    if i in exclude:
                        continue
            try:
                if type(object_to_convert.__dict__[i]) in [int, float, bool]:
                    representation[i] = object_to_convert.__dict__[i]
                elif type(object_to_convert.__dict__[i]) in [datetime]:
                    representation[i] = object_to_convert.__dict__[i].strftime('%d-%b-%Y %H:%M')
                elif type(object_to_convert.__dict__[i] in [Game, Player, Hand, Deck, Card, Dealer]):
                    representation[i] = json_rep(object_to_convert.__dict__[i], exclude_fields, include_fields)
                else:
                    representation[i] = (object_to_convert.__dict__[i])
            except Exception as e:
                # print("EXC: {}".format(e))
                pass
        return representation

    result = []
    if type(obj) in [list]:
        for o in obj:
            result.append(repr_object(o))
        return result
    else:
        return repr_object(obj)


class Card:
    """
    Class that is representing one card
    :param color: 'H', 'P', 'K', 'T'
    :param number: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14
    """

    def __init__(self, color, number):
        self.color = color
        self.number = number

    def get_value(self):
        """
        method calculates value of the card
        :return:
        """
        return self.number if self.number <= 10 else 10

    @classmethod
    def from_json(cls, jsn):
        """
        converting json to class
        :param jsn:
        :return:
        """
        if jsn:
            return cls(jsn['color'], jsn['number'])
        return None


class Deck:
    """
    class representing deck(7) of cards
    :param cards:
    """

    def __init__(self, cards=None):
        if cards:
            self.cards = cards
        else:
            self.cards = Deck.fill()

    @classmethod
    def from_json(cls, jsn):
        """
        converting json to class
        :param jsn:
        :return:
        """
        if jsn:
            cards = []
            for elem in jsn["cards"]:
                cards.append(Card.from_json(elem))
            return cls(cards)
        return None

    @classmethod
    def fill(cls):
        """
        method is filling 7 decks and shuffling them

        :return:
        """
        cards = []
        for i in range(0, 7):
            for k in ['H', 'P', 'K', 'T']:
                for num in range(1, 14):
                    cards.append(Card(k, num if num < 11 else num + 1))
        random.shuffle(cards)
        return cards

    def draw_card(self):
        """
        returning next card

        :return:
        """
        card = self.cards[0]
        self.cards = self.cards[1:]
        return card


class Hand:
    """
    hand of player or dealer
    :param cards:
    :param busted:
    :param hold:
    """

    def __init__(self, cards=None, busted=False, hold=False):
        if cards:
            self.cards = cards
        else:
            self.cards = []
        self.busted = busted
        self.hold = hold

    @classmethod
    def from_json(cls, jsn):
        """
        converting json to class
        :param jsn:
        :return:
        """
        if jsn:
            cards = []
            for elem in jsn["cards"]:
                cards.append(Card.from_json(elem))
            return cls(cards, jsn["busted"], jsn['hold'])
        return None

    def get_value(self):
        """
        returning value of hand
        :return:
        """
        value = 0
        for card in self.cards:
            value += card.get_value()
        for card in self.cards:
            if card.number == 1 and value <= 11:
                value += 10
        return value

    def add_card(self, card):
        """
        adding card to deck and checking if value of deck is busted
        :param card:
        """
        if not self.hold and not self.busted:
            self.cards.append(card)
            if self.get_value() > 21:
                self.busted = True

    def hold_hand(self):
        """
        holding hand, cards cannot be added to hand that is in state hold
        method
        """
        self.hold = True


class Player:
    """
    class describing player
    :param name:
    :param pid:
    :param hand:
    :param game_state:
    :param wins:
    """

    def __init__(self, name, pid=None, hand=None, game_state=None, wins=0):
        self.name = name
        if hand:
            self.hand = hand
        else:
            self.hand = Hand()
        self.game_state = game_state
        if not pid:
            self.id = self.id = hashlib.sha512("player-{}".format(datetime.utcnow()).encode()).hexdigest()[0:8]
        else:
            self.id = pid
        self.wins = wins

    @classmethod
    def from_json(cls, jsn):
        """
        Method used to create object of type Player from json dict
        :param jsn - json dict
        """
        if jsn:
            return cls(jsn['name'], jsn['id'], Hand.from_json(jsn['hand']), jsn['game_state'], jsn['wins'])
        return None

    def get_value(self):
        """
        returning value of player hand

        :return:
        """
        return self.hand.get_value()


class Dealer:
    """
    class representing dealer
    :param hand:
    """

    def __init__(self, hand=None):
        self.name = "Almighty Dealer"
        if hand:
            self.hand = hand
        else:
            self.hand = Hand()

    @classmethod
    def from_json(cls, jsn):
        """
        converting json to class
        :param jsn:
        :return:
        """
        return cls(Hand.from_json(jsn['hand']))


class Game:
    """
    class representing game
    :param dealer:
    :param deck:
    :param players:
    :param current_player:
    """

    def __init__(self, dealer, deck=None, players=None, current_player=None):
        self.dealer = dealer
        if not deck:
            self.deck = Deck()
        else:
            self.deck = deck
        self.players = players
        self.current_player = current_player

    def start(self):
        """
        starting game, dealing to each player and dealer 2 cards

        """
        for i in range(0, 2):
            for player in self.players:
                player.hand.add_card(self.deck.draw_card())
            self.dealer.hand.add_card(self.deck.draw_card())

    def check_turn(self, player_id):
        """
        checking if it is players turn to play
        :param player_id:
        :return:
        """
        return self.current_player and player_id == self.current_player.id

    @classmethod
    def from_json(cls, jsn):
        """
        converting json to class
        :param jsn:
        :return:
        """
        if jsn:
            players = []
            if "players" in jsn:
                for player in jsn["players"]:
                    players.append(Player.from_json(player))
            return cls(Dealer.from_json(jsn['dealer']),
                       Deck.from_json(jsn['deck']),
                       players,
                       Player.from_json(jsn['current_player']))
        return None


class GameSession:
    """
    Class representing one game session
    :param players:
    :param current_game:
    :param games:
    :param previous_game:
    :param sid:
    :param house_wins:
    :param deck:
    :param count:
    """

    def __init__(self, players=None, current_game=None, games=None, previous_game=None, sid=None, house_wins=0,
                 deck=None, count=1):
        self.players = players
        self.current_game = current_game
        if not sid:
            self.id = hashlib.sha512("session-{}".format(datetime.utcnow()).encode()).hexdigest()[0:8]
        else:
            self.id = sid
        self.games = games
        self.previous_game = previous_game
        self.house_wins = house_wins
        if not deck:
            self.deck = Deck()
        else:
            self.deck = deck
        self.count = count

    @classmethod
    def get_by_id(cls, session_id):
        """
        Returns session from id if there is session with that id
        :param session_id: session id to be checked
        :return: game session object
        """
        try:
            f = open(os.path.join(basedir, "games/g_sess_{}.json".format(session_id)))
            return cls.read_from_file(f.read())
        except Exception as e:
            print(e)
            import traceback
            traceback.print_exc()
            return None

    @classmethod
    def read_from_file(cls, data):
        """
        reading session from file
        :param data:
        :return:
        """
        jsn_rep = json.loads(data)
        players = []
        if jsn_rep["players"]:
            for player in jsn_rep["players"]:
                players.append(Player.from_json(player))
        games = []
        if jsn_rep["games"]:
            for game in jsn_rep["games"]:
                games.append(Game.from_json(game))
        return cls(players=players,
                   current_game=Game.from_json(jsn_rep["current_game"]),
                   games=games,
                   previous_game=Game.from_json(jsn_rep["previous_game"]),
                   sid=jsn_rep["id"],
                   house_wins=int(jsn_rep["house_wins"]),
                   deck=Deck.from_json(jsn_rep["deck"]),
                   count=int(jsn_rep["count"])
                   )

    def save(self):
        """
        save game session state into file
        """
        f = open(os.path.join(basedir, "games/g_sess_{}.json".format(self.id)), 'w')
        f.write(json.dumps(json_rep(self)))
        f.close()

    def add_player(self, player):
        """
        adding player to session
        :param player:
        """
        if len(self.players) >= PLAYERS:
            return Response(response=json.dumps({"error": "game already started"}),
                            status=400, mimetype="application/json")
        self.players.append(player)
        if len(self.players) == PLAYERS:
            self.current_game = Game(Dealer(), self.deck, self.players, self.players[0])
            self.current_game.start()
        self.save()

    def get_current_game(self):
        """
        returning current game

        :return:
        """
        return self.current_game

    def check_end(self):
        """

        checking if game should end, and if, calculate winner and starting new game
        """
        game = self.current_game
        done = True
        for player in game.players:
            if not player.hand.hold and not player.hand.busted:
                done = False
                break
        if done:
            while self.current_game.dealer.hand.get_value() < 17:
                self.current_game.dealer.hand.add_card(self.current_game.deck.draw_card())
            winners = []
            for player in self.current_game.players:
                if player not in winners:
                    if not winners and not player.hand.busted:
                        winners.append(player)
                    if not player.hand.busted and player.hand.get_value() > winners[0].hand.get_value():
                        winners = [player]
                    elif winners and player.hand.get_value() == winners[0].hand.get_value():
                        winners.append(player)
            awarded_wins = []
            for winner in winners:
                for playa in self.players:
                    if winner.id == playa.id and playa.id not in awarded_wins and \
                        (winner.hand.get_value() > self.current_game.dealer.hand.get_value() or
                             self.current_game.dealer.hand.busted):
                        playa.wins += 1
                        awarded_wins.append(playa.id)
            if len(awarded_wins) == 0 and not self.current_game.dealer.hand.busted:
                self.house_wins += 1
            self.games.append(self.current_game)
            self.previous_game = self.current_game
            players = []
            for player in self.players:
                players.append(Player(player.name, pid=player.id, wins=player.wins))
            players = players[-1:] + players[0:-1]
            self.players = players
            self.count += 1
            self.current_game = Game(Dealer(), self.deck, players, 0)
            new_deck = False
            if self.count == 4 and random.random() < .25:
                new_deck = True
            if self.count == 5 and random.random() < .5:
                new_deck = True
            if self.count == 6:
                new_deck = True
            if new_deck:
                self.count = 1
                self.deck = Deck()
                self.current_game.deck = self.deck
            self.current_game.start()
            self.current_game.current_player = self.current_game.players[0]

    def next_player(self):
        """
        next player

        """
        cpi = 0
        for player in self.current_game.players:

            if player.id == self.current_game.current_player.id:
                self.current_game.players[cpi % len(self.current_game.players)] = self.current_game.current_player
                break
            cpi += 1
        found = False
        all_hold_or_busted = 0
        while not found:
            cpi += 1
            cpi %= len(self.current_game.players)
            self.current_game.current_player = self.current_game.players[cpi]
            if not self.current_game.current_player.hand.hold and not self.current_game.current_player.hand.busted:
                found = True
            else:
                all_hold_or_busted += 1
            if all_hold_or_busted == len(self.current_game.players):
                break


# HELPER METHODS
def _get_game_session(session_id):
    if not session_id:
        return Response(response=json.dumps({"error": "invalid session_id"}), status=400, mimetype="application/json")
    game_session = GameSession.get_by_id(session_id)
    if not game_session:
        return Response(response=json.dumps({"error": "invalid session_id"}), status=400, mimetype="application/json")
    return game_session


# END OF HELPER METHODS


def _get_current_game(session_id, player_id):
    game_session = _get_game_session(session_id)
    if type(game_session) == Response:
        return game_session
    current_game = game_session.get_current_game()
    if not current_game:
        return Response(response=json.dumps({"error": "ERR_SESSION_DOES_NOT_HAVE_CURRENT_GAME"}), status=200,
                        mimetype="application/json"), None
    current_player = current_game.current_player
    if not current_player:
        return Response(response=json.dumps({"error": "ERR_GAME_DOES_NOT_HAVE_CURRENT_PLAYER"}), status=200,
                        mimetype="application/json"), None
    if current_player.id != player_id:
        return Response(response=json.dumps({"error": "ERR_NOT_YOUR_TURN"}), status=200,
                        mimetype="application/json"), None
    return game_session, current_game


@app.route('/join-session/<session_id>')
@app.route('/join-session/<session_id>/<name>')
def join_session(session_id=None, name=None):
    """
    This call is used when you're playing against other player, and it will be used in competition for player that will
    join second. Make sure that you include shortcut in your bot so you can send this call
    :param session_id: session id that exist in a system, ususaly one returned from join-game-mode call
    :param name: name of the player - strongly suggested to be sent
    :return: json with player_id - save that id as it is needed in other calls
    """
    game_session = _get_game_session(session_id)
    if type(game_session) == Response:
        return game_session
    if not name:
        return Response(response=json.dumps({"status": "ERROR", "error": "nube fali ti ime"}),
                        status=400, mimetype="application/json")
    player = Player(name)
    resp = {"player_id": player.id}
    try:
        game_session.add_player(player)
    except Exception as e:
        print(e)
    return Response(response=json.dumps(resp),
                    status=200, mimetype="application/json")


@app.route('/get-game-state/<session_id>')
def get_game_state(session_id=None):
    """
    returning state of current game
    :param session_id:
    :return:
    """
    game_session = _get_game_session(session_id)
    if type(game_session) == Response:
        return game_session
    game = game_session.get_current_game()
    return Response(response=json.dumps(json_rep(game, exclude_fields={
        Game: ["deck"]
    })), status=200, mimetype="application/json")


@app.route('/check-turn/<session_id>/<player_id>')
def check_turn(session_id=None, player_id=None):
    """
    checking if player_id is next to play
    :param session_id:
    :param player_id:
    :return:
    """
    game_session = _get_game_session(session_id)
    if type(game_session) == Response:
        return game_session
    if not game_session.get_current_game():
        return Response(response=json.dumps({"status": "ERROR", "error": "game not started yet"}),
                        status=400, mimetype="application/json")
    return Response(response=json.dumps({"player_turn": game_session.get_current_game().check_turn(player_id)}),
                    status=200, mimetype="application/json")


@app.route('/hit/<session_id>/<player_id>')
def hit_card(session_id=None, player_id=None):
    """
    adding new card to deck
    :param session_id:
    :param player_id:
    :return:
    """
    game_session, current_game = _get_current_game(session_id, player_id)
    if type(game_session) == Response:
        return game_session
    current_player = current_game.current_player

    card = current_game.deck.draw_card()
    current_player.hand.add_card(card)
    # current_game.current_player = current_player
    # game_session.current_game = current_game
    game_session.next_player()
    game_session.check_end()
    game_session.save()

    return Response(response=json.dumps({"player": json_rep(current_player)}), status=200, mimetype="application/json")


@app.route('/hold/<session_id>/<player_id>')
def hold_card(session_id=None, player_id=None):
    """
    setting player hand state to hold
    :param session_id:
    :param player_id:
    :return:
    """
    game_session, current_game = _get_current_game(session_id, player_id)
    current_game.current_player.hand.hold_hand()
    game_session.next_player()
    game_session.check_end()
    game_session.save()
    return Response(response=json.dumps({"message": "HAND_HOLD"}), status=200, mimetype="application/json")


@app.route('/get-session-state/<session_id>')
def get_session_state(session_id=None):
    """
    returning state of whole session
    :param session_id:
    :return:
    """
    game_session = _get_game_session(session_id)
    if type(game_session) == Response:
        return game_session
    return Response(response=json.dumps(json_rep(game_session, exclude_fields={
        GameSession: ["deck", "count"],
        Game: ["deck", "count"]
    })), status=200, mimetype="application/json")


@app.route('/get-previous-game/<session_id>')
def get_previous_game(session_id=None):
    """
    returning previous game
    :param session_id:
    :return:
    """
    game_session = _get_game_session(session_id)
    if type(game_session) == Response:
        return game_session
    return Response(response=json.dumps(json_rep(game_session.previous_game, exclude_fields={
        Game: ["deck", "count"]
    })), status=200, mimetype="application/json")


@app.route('/')
def index():
    return render_template("index.html")


if __name__ == "__main__":
    sess = GameSession(sid=111111)
    sess.save()
    app.run(port=9999, host="127.0.0.1")